
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { DateRange } from "react-day-picker";
import { useToast } from "@/hooks/use-toast";

interface Transaction {
  id: string;
  createdAt: string;
  userId: string;
  userEmail: string;
  userName: string;
  type: 'deposit' | 'purchase' | 'refund' | 'adjustment';
  amount: number;
  method: string;
  status: 'completed' | 'pending' | 'failed';
}

interface TransactionSummary {
  totalVolume: number;
  totalDeposits: number;
  totalPurchases: number;
  totalRefunds: number;
}

interface TransactionFilters {
  searchQuery?: string;
  typeFilter?: string | null;
  statusFilter?: string | null;
  methodFilter?: string | null;
  dateRange?: DateRange | undefined;
}

export const useTransactions = (filters: TransactionFilters) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [summary, setSummary] = useState<TransactionSummary>({
    totalVolume: 0,
    totalDeposits: 0,
    totalPurchases: 0,
    totalRefunds: 0
  });
  const { toast } = useToast();

  // Mock data for now (would be replaced with real Supabase calls)
  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      try {
        // In a real implementation, we would use Supabase to fetch transactions
        // const { data, error } = await supabase.from('transactions')...
        
        // For now, let's use mock data
        const mockTransactions = generateMockTransactions();
        const filteredTransactions = applyFilters(mockTransactions, filters);
        
        setTimeout(() => {
          setTransactions(filteredTransactions);
          calculateSummary(mockTransactions);
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        toast({
          title: "Error",
          description: "Failed to fetch transactions. Please try again.",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [
    filters.searchQuery,
    filters.typeFilter,
    filters.statusFilter,
    filters.methodFilter,
    filters.dateRange
  ]);

  const applyFilters = (data: Transaction[], filters: TransactionFilters) => {
    return data.filter(transaction => {
      // Search query filter
      if (filters.searchQuery && !transaction.id.toLowerCase().includes(filters.searchQuery.toLowerCase()) && 
          !transaction.userEmail.toLowerCase().includes(filters.searchQuery.toLowerCase())) {
        return false;
      }
      
      // Type filter
      if (filters.typeFilter && transaction.type !== filters.typeFilter) {
        return false;
      }
      
      // Status filter
      if (filters.statusFilter && transaction.status !== filters.statusFilter) {
        return false;
      }
      
      // Method filter
      if (filters.methodFilter && transaction.method !== filters.methodFilter) {
        return false;
      }
      
      // Date range filter
      if (filters.dateRange && filters.dateRange.from) {
        const transactionDate = new Date(transaction.createdAt);
        const fromDate = new Date(filters.dateRange.from);
        fromDate.setHours(0, 0, 0, 0);
        
        if (transactionDate < fromDate) {
          return false;
        }
        
        if (filters.dateRange.to) {
          const toDate = new Date(filters.dateRange.to);
          toDate.setHours(23, 59, 59, 999);
          
          if (transactionDate > toDate) {
            return false;
          }
        }
      }
      
      return true;
    });
  };

  const calculateSummary = (data: Transaction[]) => {
    const summary = data.reduce((acc, transaction) => {
      const amount = Math.abs(transaction.amount);
      
      acc.totalVolume += amount;
      
      if (transaction.type === 'deposit') {
        acc.totalDeposits += amount;
      } else if (transaction.type === 'purchase') {
        acc.totalPurchases += amount;
      } else if (transaction.type === 'refund') {
        acc.totalRefunds += amount;
      }
      
      return acc;
    }, {
      totalVolume: 0,
      totalDeposits: 0,
      totalPurchases: 0,
      totalRefunds: 0
    });
    
    setSummary(summary);
  };

  const approveTransaction = async (id: string) => {
    setIsLoading(true);
    try {
      // In a real implementation, we would use Supabase to update the transaction
      // const { data, error } = await supabase.from('transactions').update({ status: 'completed' }).eq('id', id);
      
      // Mock update
      setTransactions(prevTransactions => 
        prevTransactions.map(transaction => 
          transaction.id === id ? { ...transaction, status: 'completed' } : transaction
        )
      );
      
      toast({
        title: "Transaction Approved",
        description: `Transaction #${id.substring(0, 8)} has been approved.`,
      });
    } catch (error) {
      console.error('Error approving transaction:', error);
      toast({
        title: "Error",
        description: "Failed to approve transaction. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const rejectTransaction = async (id: string) => {
    setIsLoading(true);
    try {
      // In a real implementation, we would use Supabase to update the transaction
      // const { data, error } = await supabase.from('transactions').update({ status: 'failed' }).eq('id', id);
      
      // Mock update
      setTransactions(prevTransactions => 
        prevTransactions.map(transaction => 
          transaction.id === id ? { ...transaction, status: 'failed' } : transaction
        )
      );
      
      toast({
        title: "Transaction Rejected",
        description: `Transaction #${id.substring(0, 8)} has been rejected.`,
      });
    } catch (error) {
      console.error('Error rejecting transaction:', error);
      toast({
        title: "Error",
        description: "Failed to reject transaction. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refundTransaction = async (id: string) => {
    setIsLoading(true);
    try {
      // In a real implementation, we would create a refund record in Supabase
      // const { data, error } = await supabase.from('transactions').insert([{ type: 'refund', ... }]);
      
      // Mock update by adding a new refund transaction
      const transaction = transactions.find(t => t.id === id);
      
      if (transaction) {
        const refundTransaction: Transaction = {
          id: `refund-${Math.random().toString(36).substring(2, 10)}`,
          createdAt: new Date().toISOString(),
          userId: transaction.userId,
          userEmail: transaction.userEmail,
          userName: transaction.userName,
          type: 'refund',
          amount: -transaction.amount, // Negative amount for refunds
          method: transaction.method,
          status: 'completed'
        };
        
        setTransactions(prevTransactions => [refundTransaction, ...prevTransactions]);
        
        toast({
          title: "Refund Processed",
          description: `Refund for transaction #${id.substring(0, 8)} has been processed.`,
        });
      } else {
        toast({
          title: "Error",
          description: "Transaction not found. Cannot process refund.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error processing refund:', error);
      toast({
        title: "Error",
        description: "Failed to process refund. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    transactions,
    isLoading,
    summary,
    approveTransaction,
    rejectTransaction,
    refundTransaction
  };
};

// Helper function to generate mock transactions
const generateMockTransactions = (): Transaction[] => {
  const types: Array<'deposit' | 'purchase' | 'refund' | 'adjustment'> = ['deposit', 'purchase', 'refund', 'adjustment'];
  const methods = ['paypal', 'crypto', 'manual'];
  const statuses: Array<'completed' | 'pending' | 'failed'> = ['completed', 'pending', 'failed'];
  
  return Array(25).fill(0).map((_, i) => {
    const type = types[Math.floor(Math.random() * types.length)];
    const isRefund = type === 'refund';
    const amount = isRefund 
      ? -(Math.random() * 500 + 10).toFixed(2) 
      : (Math.random() * 500 + 10).toFixed(2);
    
    return {
      id: `trans-${Math.random().toString(36).substring(2, 10)}`,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
      userId: `user-${Math.random().toString(36).substring(2, 10)}`,
      userEmail: `user${i}@example.com`,
      userName: `User ${i + 1}`,
      type,
      amount: parseFloat(amount),
      method: methods[Math.floor(Math.random() * methods.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)]
    };
  });
};
