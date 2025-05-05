
export type DepositStatus = "pending" | "completed" | "rejected";

export interface Deposit {
  id: string;
  user_id: string;
  amount: number;
  payment_method: string;
  status: string;
  created_at: string;
  updated_at: string;
  transaction_hash?: string;
  paypal_order_id?: string;
  paypal_payer_id?: string;
  paypal_payer_email?: string;
  metadata?: Record<string, any>;
  profiles?: {
    email?: string;
    username?: string;
  } | null;
}
