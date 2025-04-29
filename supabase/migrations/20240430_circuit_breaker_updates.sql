
-- Add half_open and consecutive_success columns to api_health table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_schema = 'public' AND table_name = 'api_health' 
                AND column_name = 'half_open') THEN
    ALTER TABLE public.api_health ADD COLUMN half_open BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_schema = 'public' AND table_name = 'api_health' 
                AND column_name = 'consecutive_success') THEN
    ALTER TABLE public.api_health ADD COLUMN consecutive_success INTEGER DEFAULT 0;
  END IF;
END $$;

-- Create function to set circuit to half-open state
CREATE OR REPLACE FUNCTION public.set_circuit_half_open(api_name_param TEXT)
RETURNS void
LANGUAGE sql
AS $$
  UPDATE public.api_health 
  SET half_open = true, 
      is_open = false,
      updated_at = now()
  WHERE api_name = api_name_param;
$$;

-- Create function to reset half-open state
CREATE OR REPLACE FUNCTION public.reset_circuit_half_open(api_name_param TEXT)
RETURNS void
LANGUAGE sql
AS $$
  UPDATE public.api_health 
  SET half_open = false, 
      consecutive_success = 0,
      updated_at = now()
  WHERE api_name = api_name_param;
$$;

-- Create function to increment consecutive success
CREATE OR REPLACE FUNCTION public.increment_consecutive_success(api_name_param TEXT)
RETURNS integer
LANGUAGE sql
AS $$
  UPDATE public.api_health 
  SET consecutive_success = consecutive_success + 1,
      updated_at = now()
  WHERE api_name = api_name_param
  RETURNING consecutive_success;
$$;
