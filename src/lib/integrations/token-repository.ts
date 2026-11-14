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


export async function acquireTokenRefreshLock(
  provider: string,
  lockId: string,
): Promise<boolean> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase.rpc(
    "acquire_token_refresh_lock",
    {
      p_provider: provider,
      p_lock_id: lockId,
      p_lease_seconds: 120,
    },
  );

  if (error) {
    throw error;
  }

  return data === true;
}

export async function releaseTokenRefreshLock(
  provider: string,
  lockId: string,
): Promise<boolean> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase.rpc(
    "release_token_refresh_lock",
    {
      p_provider: provider,
      p_lock_id: lockId,
    },
  );

  if (error) {
    throw error;
  }

  return data === true;
}

export async function saveRefreshedIntegrationToken(
  provider: string,
  token: IntegrationToken,
  lockId: string,
): Promise<void> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("integration_tokens")
    .update({
      access_token_encrypted: encryptToken(token.accessToken),
      refresh_token_encrypted: encryptToken(token.refreshToken),
      token_type: token.tokenType,
      scope: token.scope,
      expires_at: token.expiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq("provider", provider)
    .eq("refresh_lock_id", lockId)
    .select("provider")
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error(
      "Cannot save refreshed token: refresh lock is no longer owned",
    );
  }
}
