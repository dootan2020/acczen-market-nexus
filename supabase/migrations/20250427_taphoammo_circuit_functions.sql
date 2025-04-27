
-- Function to increment error count
CREATE OR REPLACE FUNCTION public.increment_error_count()
RETURNS integer
LANGUAGE sql
AS $$
  SELECT error_count + 1 FROM api_health WHERE api_name = 'taphoammo'
$$;

-- Function to check if circuit should be open (error count >= 2)
CREATE OR REPLACE FUNCTION public.check_if_should_open_circuit()
RETURNS boolean
LANGUAGE sql
AS $$
  SELECT CASE 
    WHEN (SELECT error_count + 1 FROM api_health WHERE api_name = 'taphoammo') >= 2 
    THEN true 
    ELSE false 
  END
$$;

-- Function to update opened_at timestamp if circuit becomes open
CREATE OR REPLACE FUNCTION public.update_opened_at_if_needed()
RETURNS timestamptz
LANGUAGE sql
AS $$
  SELECT CASE 
    WHEN (SELECT error_count + 1 FROM api_health WHERE api_name = 'taphoammo') >= 2 
    THEN now() 
    ELSE opened_at 
  END
  FROM api_health WHERE api_name = 'taphoammo'
$$;
