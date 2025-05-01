
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface StatusHistoryItem {
  status: string;
  timestamp: string;
  by?: string;
}

interface PaymentDetails {
  email?: string;
  id?: string;
  hash?: string;
  address?: string;
}

interface Attachment {
  name: string;
  url: string;
}

interface TransactionDetail {
  id: string;
  createdAt: string;
  userId: string;
  userEmail: string;
  userName: string;
  type: 'deposit' | 'purchase' | 'refund' | 'adjustment';
  amount: number;
  method: string;
  status: string;
  paymentDetails?: PaymentDetails;
  statusHistory?: StatusHistoryItem[];
  notes?: string;
  attachments?: Attachment[];
}

export const useTransactionDetails = (transactionId: string) => {
  const [transaction, setTransaction] = useState<TransactionDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTransactionDetails = async () => {
      if (!transactionId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // In a real implementation, we would get data from Supabase
        // const { data, error } = await supabase
        //   .from('transactions')
        //   .select('*, profiles(*)')
        //   .eq('id', transactionId)
        //   .single();
        
        // For now, simulate API call with mock data
        setTimeout(() => {
          // Generate mock transaction detail
          const mockTransaction = generateMockTransactionDetail(transactionId);
          setTransaction(mockTransaction);
          setIsLoading(false);
        }, 700);
        
      } catch (err: any) {
        console.error('Error fetching transaction details:', err);
        setError(err);
        setIsLoading(false);
        toast({
          title: "Error",
          description: "Failed to fetch transaction details.",
          variant: "destructive"
        });
      }
    };

    fetchTransactionDetails();
  }, [transactionId]);

  return { transaction, isLoading, error };
};

// Helper to generate mock transaction detail
const generateMockTransactionDetail = (id: string): TransactionDetail => {
  const types: Array<'deposit' | 'purchase' | 'refund' | 'adjustment'> = ['deposit', 'purchase', 'refund', 'adjustment'];
  const methods = ['paypal', 'crypto', 'manual'];
  const statuses = ['completed', 'pending', 'failed'];
  
  const type = types[Math.floor(Math.random() * types.length)];
  const method = methods[Math.floor(Math.random() * methods.length)];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const isRefund = type === 'refund';
  const amount = isRefund 
    ? -parseFloat((Math.random() * 500 + 10).toFixed(2)) 
    : parseFloat((Math.random() * 500 + 10).toFixed(2));
  
  const createdAt = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString();
  
  // Generate mock status history
  const statusHistory: StatusHistoryItem[] = [
    {
      status: 'pending',
      timestamp: createdAt,
      by: 'system'
    }
  ];
  
  if (status !== 'pending') {
    const completedTime = new Date(new Date(createdAt).getTime() + 1000 * 60 * 30).toISOString();
    statusHistory.push({
      status,
      timestamp: completedTime,
      by: 'admin@example.com'
    });
  }
  
  // Generate mock payment details based on method
  let paymentDetails: PaymentDetails | undefined;
  
  if (method === 'paypal') {
    paymentDetails = {
      email: 'customer@example.com',
      id: `PAYPAL-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
    };
  } else if (method === 'crypto') {
    paymentDetails = {
      hash: `0x${Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      address: `0x${Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`
    };
  }
  
  // Maybe add notes
  const notes = Math.random() > 0.7 ? 'Customer requested express processing. Approved by manager.' : undefined;
  
  // Maybe add attachments
  const attachments = method === 'manual' ? [
    {
      name: 'Receipt.pdf',
      url: '#'
    },
    {
      name: 'Bank_Statement.pdf',
      url: '#'
    }
  ] : undefined;
  
  return {
    id,
    createdAt,
    userId: `user-${Math.random().toString(36).substring(2, 10)}`,
    userEmail: `customer${Math.floor(Math.random() * 1000)}@example.com`,
    userName: `Customer ${Math.floor(Math.random() * 1000)}`,
    type,
    amount,
    method,
    status,
    paymentDetails,
    statusHistory,
    notes,
    attachments
  };
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};
