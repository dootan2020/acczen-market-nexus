
-- Create api_logs table for monitoring API calls
CREATE TABLE IF NOT EXISTS public.api_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  status TEXT NOT NULL,
  response_time DOUBLE PRECISION,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS api_logs_api_idx ON public.api_logs(api);
CREATE INDEX IF NOT EXISTS api_logs_status_idx ON public.api_logs(status);
CREATE INDEX IF NOT EXISTS api_logs_created_at_idx ON public.api_logs(created_at);

-- RLS: Admin only access
ALTER TABLE public.api_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view api logs"
  ON public.api_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Functions can insert logs without restrictions
CREATE POLICY "Edge functions can insert api logs"
  ON public.api_logs
  FOR INSERT
  WITH CHECK (true);
