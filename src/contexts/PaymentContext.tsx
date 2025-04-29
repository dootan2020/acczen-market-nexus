
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

// Define types for our context
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface PaymentVerification {
  id: string;
  deposit_id: string;
  transaction_hash: string;
  status: PaymentStatus;
  verification_attempts: number;
  verification_data: any;
  last_checked_at: string;
  created_at: string;
  updated_at: string;
}

export interface Deposit {
  id: string;
  user_id: string;
  amount: number;
  payment_method: string;
  payment_id: string;
  status: PaymentStatus;
  transaction_hash: string;
  created_at: string;
  updated_at: string;
  paypal_order_id: string;
  paypal_payer_id: string;
  paypal_payer_email: string;
  metadata: any;
}

interface PaymentContextType {
  deposits: Deposit[];
  verifications: PaymentVerification[];
  refreshDeposits: () => Promise<void>;
  getDepositStatus: (depositId: string) => PaymentStatus | undefined;
  isLoading: boolean;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};

interface PaymentProviderProps {
  children: ReactNode;
}

export const PaymentProvider = ({ children }: PaymentProviderProps) => {
  const { user } = useAuth();
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [verifications, setVerifications] = useState<PaymentVerification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshDeposits = async () => {
    if (!user) return;
    setIsLoading(true);
    
    try {
      // Fetch deposits
      const { data: depositsData, error: depositsError } = await supabase
        .from('deposits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (depositsError) throw depositsError;

      // Fetch verifications
      const { data: verificationsData, error: verificationsError } = await supabase
        .from('payment_verifications')
        .select('*')
        .in('deposit_id', depositsData.map(d => d.id))
        .order('created_at', { ascending: false });

      if (verificationsError) throw verificationsError;

      // Update state with type casting to ensure proper types
      setVerifications(verificationsData.map(v => ({
        ...v,
        status: (v.status as PaymentStatus) || 'pending'
      })));
      
      setDeposits(depositsData.map(d => ({
        ...d,
        status: (d.status as PaymentStatus) || 'pending'
      })));
      
    } catch (error) {
      console.error('Error fetching payment data:', error);
      toast.error('Failed to load payment data');
    } finally {
      setIsLoading(false);
    }
  };

  const getDepositStatus = (depositId: string) => {
    const deposit = deposits.find(d => d.id === depositId);
    return deposit?.status;
  };

  useEffect(() => {
    if (user) {
      refreshDeposits();

      // Set up realtime subscription for deposits
      const depositsSubscription = supabase
        .channel('deposits-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'deposits',
          filter: `user_id=eq.${user.id}`
        }, () => {
          refreshDeposits();
        })
        .subscribe();

      // Set up realtime subscription for verifications
      const verificationsSubscription = supabase
        .channel('verifications-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'payment_verifications'
        }, (payload) => {
          // Check if the payload and payload.new exist and have the deposit_id property
          if (payload && payload.new && 'deposit_id' in payload.new) {
            const depositId = payload.new.deposit_id;
            if (depositId && deposits.some(d => d.id === depositId)) {
              refreshDeposits();
            }
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(depositsSubscription);
        supabase.removeChannel(verificationsSubscription);
      };
    }
  }, [user]);

  const value = {
    deposits,
    verifications,
    refreshDeposits,
    getDepositStatus,
    isLoading
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};
