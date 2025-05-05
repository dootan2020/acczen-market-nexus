
-- Function to increment success count and potentially reset circuit breaker
CREATE OR REPLACE FUNCTION public.increment_success_count(api_name_param TEXT)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update the success count for the API
  UPDATE api_health
  SET 
    consecutive_success = consecutive_success + 1,
    half_open = CASE WHEN is_open THEN true ELSE half_open END
  WHERE api_name = api_name_param;
  
  -- If we have enough successful calls in half-open mode, close the circuit
  UPDATE api_health
  SET 
    is_open = false,
    half_open = false,
    error_count = 0,
    consecutive_success = 0,
    opened_at = NULL
  WHERE 
    api_name = api_name_param AND
    is_open = true AND
    half_open = true AND
    consecutive_success >= 3;  -- After 3 successful calls
END;
$$;
