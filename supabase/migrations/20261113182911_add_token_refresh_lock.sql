
-- Add refresh lock columns.
ALTER TABLE public.integration_tokens
ADD COLUMN refresh_lock_id UUID,
ADD COLUMN refresh_lock_expires_at TIMESTAMPTZ;

-- Atomically acquire a refresh lock.
CREATE OR REPLACE FUNCTION public.acquire_token_refresh_lock(
  p_provider TEXT,
  p_lock_id UUID,
  p_lease_seconds INTEGER DEFAULT 60
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  affected_rows INTEGER;
BEGIN
  IF p_lease_seconds < 1 OR p_lease_seconds > 120 THEN
    RAISE EXCEPTION 'Invalid refresh lock lease duration';
  END IF;

  UPDATE public.integration_tokens
  SET
    refresh_lock_id = p_lock_id,
    refresh_lock_expires_at =
      pg_catalog.now() +
      pg_catalog.make_interval(secs => p_lease_seconds)
  WHERE provider = p_provider
    AND (
      refresh_lock_id IS NULL
      OR refresh_lock_expires_at IS NULL
      OR refresh_lock_expires_at <= pg_catalog.now()
    );

  GET DIAGNOSTICS affected_rows = ROW_COUNT;

  RETURN affected_rows = 1;
END;
$$;

-- Release a lock only if the caller owns it.
CREATE OR REPLACE FUNCTION public.release_token_refresh_lock(
  p_provider TEXT,
  p_lock_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  affected_rows INTEGER;
BEGIN
  UPDATE public.integration_tokens
  SET
    refresh_lock_id = NULL,
    refresh_lock_expires_at = NULL
  WHERE provider = p_provider
    AND refresh_lock_id = p_lock_id;

  GET DIAGNOSTICS affected_rows = ROW_COUNT;

  RETURN affected_rows = 1;
END;
$$;

-- Restrict function execution.
REVOKE ALL ON FUNCTION
  public.acquire_token_refresh_lock(TEXT, UUID, INTEGER)
FROM PUBLIC, anon, authenticated;

REVOKE ALL ON FUNCTION
  public.release_token_refresh_lock(TEXT, UUID)
FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION
  public.acquire_token_refresh_lock(TEXT, UUID, INTEGER)
TO service_role;

GRANT EXECUTE ON FUNCTION
  public.release_token_refresh_lock(TEXT, UUID)
TO service_role;
