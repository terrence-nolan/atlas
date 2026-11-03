CREATE TABLE public.integration_tokens (
  provider TEXT PRIMARY KEY,

  access_token_encrypted TEXT NOT NULL,
  refresh_token_encrypted TEXT NOT NULL,

  token_type TEXT NOT NULL DEFAULT 'Bearer',
  scope TEXT,

  expires_at TIMESTAMPTZ NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT integration_tokens_provider_not_empty
    CHECK (LENGTH(TRIM(provider)) > 0)
);

-- Require row-level security.
ALTER TABLE public.integration_tokens
  ENABLE ROW LEVEL SECURITY;

-- Remove access from public-facing roles.
REVOKE ALL ON TABLE public.integration_tokens
  FROM PUBLIC, anon, authenticated;

-- Allow our privileged server-side client to manage tokens.
GRANT SELECT, INSERT, UPDATE, DELETE
  ON TABLE public.integration_tokens
  TO service_role;