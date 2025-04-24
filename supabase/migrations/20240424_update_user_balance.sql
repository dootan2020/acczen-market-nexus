
-- Create function to update user balance and handle transactions
CREATE OR REPLACE FUNCTION public.update_user_balance(user_id UUID, amount NUMERIC)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update user balance
  UPDATE public.profiles
  SET balance = balance + amount
  WHERE id = user_id;
  
  -- No need to create a transaction record here since it's handled in the edge function
END;
$$;
