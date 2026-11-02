import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/server";
import {
  decryptToken,
  encryptToken,
} from "@/lib/security/token-encryption";

import type { IntegrationToken } from "./token-types";

export async function getIntegrationToken(
  provider: string,
): Promise<IntegrationToken | null> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("integration_tokens")
    .select(
      "access_token_encrypted, refresh_token_encrypted, token_type, scope, expires_at",
    )
    .eq("provider", provider)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return {
    accessToken: decryptToken(data.access_token_encrypted),
    refreshToken: decryptToken(data.refresh_token_encrypted),
    tokenType: data.token_type,
    scope: data.scope,
    expiresAt: data.expires_at,
  };
}

export async function saveIntegrationToken(
  provider: string,
  token: IntegrationToken,
): Promise<void> {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from("integration_tokens")
    .upsert(
      {
        provider,
        access_token_encrypted: encryptToken(token.accessToken),
        refresh_token_encrypted: encryptToken(token.refreshToken),
        token_type: token.tokenType,
        scope: token.scope,
        expires_at: token.expiresAt,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "provider",
      },
    );

  if (error) {
    throw error;
  }
}

export async function deleteIntegrationToken(
  provider: string,
): Promise<void> {
  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from("integration_tokens")
    .delete()
    .eq("provider", provider);

  if (error) {
    throw error;
  }
}
