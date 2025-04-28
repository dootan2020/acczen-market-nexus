
import React, { createContext, useContext, useState } from 'react';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface PaymentVerification {
  id: string;
  deposit_id: string;
  transaction_hash: string;
  verification_attempts: number;
  status: PaymentStatus;
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
  status: PaymentStatus;
  transaction_hash?: string;
  created_at: string;
  updated_at: string;
}

interface PaymentContextType {
  deposits: Deposit[];
  verifications: PaymentVerification[];
  isLoading: boolean;
  pendingDeposits: Deposit[];
  completedDeposits: Deposit[];
  failedDeposits: Deposit[];
  refreshDeposits: () => Promise<void>;
  getDepositStatus: (depositId: string) => PaymentStatus | undefined;
  getVerification: (depositId: string) => PaymentVerification | undefined;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const PaymentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [verifications, setVerifications] = useState<PaymentVerification[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user } = useAuth();

  const fetchDeposits = async () => {
    if (!user) {
      setDeposits([]);
      setVerifications([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Get deposits
      const { data: depositsData, error: depositsError } = await supabase
        .from('deposits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (depositsError) throw depositsError;

      // Get verifications
      const depositIds = (depositsData || []).map(deposit => deposit.id);
      
      if (depositIds.length > 0) {
        const { data: verificationsData, error: verificationsError } = await supabase
          .from('payment_verifications')
          .select('*')
          .in('deposit_id', depositIds)
          .order('created_at', { ascending: false });

        if (verificationsError) throw verificationsError;
        
        // Cast the status to PaymentStatus type
        setVerifications(
          (verificationsData || []).map(verification => ({
            ...verification,
            status: verification.status as PaymentStatus
          }))
        );
      }
      
      // Cast the status to PaymentStatus type
      setDeposits(
        (depositsData || []).map(deposit => ({
          ...deposit,
          status: deposit.status as PaymentStatus
        }))
      );
    } catch (error) {
      console.error('Error fetching payment data:', error);
      toast.error('Could not load payment history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits();

    // Set up realtime listeners for deposits and verifications
    if (user) {
      const depositChannel = supabase
        .channel('deposits-changes')
        .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'deposits', filter: `user_id=eq.${user.id}` }, 
            (payload) => {
              if (payload.eventType === 'INSERT') {
                const newDeposit = {
                  ...payload.new as any,
                  status: payload.new.status as PaymentStatus
                };
                setDeposits(prev => [newDeposit, ...prev]);
              } else if (payload.eventType === 'UPDATE') {
                const updatedDeposit = {
                  ...payload.new as any,
                  status: payload.new.status as PaymentStatus
                };
                
                setDeposits(prev => 
                  prev.map(deposit => 
                    deposit.id === payload.new.id ? updatedDeposit : deposit
                  )
                );
                
                // Show status notification
                if (updatedDeposit.status === 'completed') {
                  toast.success(`Deposit of ${updatedDeposit.amount} ${updatedDeposit.payment_method} has been completed!`);
                } else if (updatedDeposit.status === 'failed') {
                  toast.error(`Deposit of ${updatedDeposit.amount} ${updatedDeposit.payment_method} has failed.`);
                }
              }
            }
        )
        .subscribe();
      
      const verificationChannel = supabase
        .channel('verifications-changes')
        .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'payment_verifications' }, 
            (payload) => {
              if (payload.eventType === 'INSERT') {
                // Check if this verification belongs to current user's deposit
                const depositIds = deposits.map(d => d.id);
                const newVerification = {
                  ...payload.new as any,
                  status: payload.new.status as PaymentStatus
                };
                
                if (depositIds.includes(newVerification.deposit_id)) {
                  setVerifications(prev => [newVerification, ...prev]);
                }
              } else if (payload.eventType === 'UPDATE') {
                const updatedVerification = {
                  ...payload.new as any,
                  status: payload.new.status as PaymentStatus
                };
                
                setVerifications(prev => 
                  prev.map(verification => 
                    verification.id === payload.new.id ? updatedVerification : verification
                  )
                );
              }
            }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(depositChannel);
        supabase.removeChannel(verificationChannel);
      };
    }
  }, [user]);

  const pendingDeposits = deposits.filter(d => d.status === 'pending' || d.status === 'processing');
  const completedDeposits = deposits.filter(d => d.status === 'completed');
  const failedDeposits = deposits.filter(d => d.status === 'failed');

  const getDepositStatus = (depositId: string): PaymentStatus | undefined => {
    const deposit = deposits.find(d => d.id === depositId);
    return deposit?.status;
  };

  const getVerification = (depositId: string): PaymentVerification | undefined => {
    return verifications.find(v => v.deposit_id === depositId);
  };

  const refreshDeposits = async () => {
    await fetchDeposits();
  };

  return (
    <PaymentContext.Provider value={{
      deposits,
      verifications,
      isLoading,
      pendingDeposits,
      completedDeposits,
      failedDeposits,
      refreshDeposits,
      getDepositStatus,
      getVerification
    }}>
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};
