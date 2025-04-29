
-- Create a function to get discount distribution data
CREATE OR REPLACE FUNCTION public.get_discount_distribution()
RETURNS TABLE (
  discount_range TEXT,
  user_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH discount_ranges AS (
    SELECT 
      CASE 
        WHEN discount_percentage = 0 THEN '0%'
        WHEN discount_percentage > 0 AND discount_percentage <= 5 THEN '1-5%'
        WHEN discount_percentage > 5 AND discount_percentage <= 10 THEN '6-10%'
        WHEN discount_percentage > 10 AND discount_percentage <= 15 THEN '11-15%'
        WHEN discount_percentage > 15 AND discount_percentage <= 20 THEN '16-20%'
        WHEN discount_percentage > 20 AND discount_percentage <= 30 THEN '21-30%'
        WHEN discount_percentage > 30 AND discount_percentage <= 50 THEN '31-50%'
        ELSE '51%+'
      END as discount_range,
      id
    FROM 
      public.profiles
  )
  SELECT 
    discount_range,
    COUNT(*) as user_count
  FROM 
    discount_ranges
  GROUP BY 
    discount_range
  ORDER BY 
    CASE discount_range
      WHEN '0%' THEN 1
      WHEN '1-5%' THEN 2
      WHEN '6-10%' THEN 3
      WHEN '11-15%' THEN 4
      WHEN '16-20%' THEN 5
      WHEN '21-30%' THEN 6
      WHEN '31-50%' THEN 7
      WHEN '51%+' THEN 8
      ELSE 9
    END;
END;
$$ LANGUAGE plpgsql;
