
-- Function to begin a transaction with advisory lock
CREATE OR REPLACE FUNCTION public.begin_transaction(p_user_id UUID, p_transaction_id UUID)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
  -- Use the hash of user_id and transaction_id as our lock key
  -- Advisory locks are session-level locks that allow us to implement application-level locking
  PERFORM pg_advisory_xact_lock(hashtext(p_user_id::text || p_transaction_id::text));
  
  -- Create a temporary transaction record
  INSERT INTO public.transaction_locks (id, user_id, status)
  VALUES (p_transaction_id, p_user_id, 'processing');
  
  RETURN true;
EXCEPTION WHEN OTHERS THEN
  RETURN false;
END;
$$;

-- Function to commit a transaction
CREATE OR REPLACE FUNCTION public.commit_transaction(p_transaction_id UUID)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.transaction_locks
  SET status = 'completed', 
      completed_at = now(),
      updated_at = now()
  WHERE id = p_transaction_id;
  
  RETURN true;
EXCEPTION WHEN OTHERS THEN
  RETURN false;
END;
$$;

-- Function to rollback a transaction
CREATE OR REPLACE FUNCTION public.rollback_transaction(p_transaction_id UUID)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.transaction_locks
  SET status = 'failed',
      completed_at = now(),
      updated_at = now()
  WHERE id = p_transaction_id;
  
  RETURN true;
EXCEPTION WHEN OTHERS THEN
  RETURN false;
END;
$$;

-- Create transaction locks table to track transaction state
CREATE TABLE IF NOT EXISTS public.transaction_locks (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  status TEXT NOT NULL CHECK (status IN ('processing', 'completed', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Create index for faster lookups by user
CREATE INDEX IF NOT EXISTS transaction_locks_user_id_idx ON public.transaction_locks(user_id);

-- Create cache_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.cache_items (
  id BIGSERIAL PRIMARY KEY,
  cache_key TEXT NOT NULL UNIQUE,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  metadata JSONB
);

-- Create index for faster cache lookups
CREATE INDEX IF NOT EXISTS cache_items_key_idx ON public.cache_items(cache_key);
CREATE INDEX IF NOT EXISTS cache_items_expiry_idx ON public.cache_items(expires_at);

-- Add auto-cleanup of expired cache items (runs daily)
CREATE OR REPLACE FUNCTION public.cleanup_expired_cache_items()
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count INT;
BEGIN
  DELETE FROM public.cache_items
  WHERE expires_at < now()
  RETURNING COUNT(*) INTO deleted_count;
  
  RETURN deleted_count;
END;
$$;
