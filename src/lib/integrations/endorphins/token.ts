import "server-only";

import {
  getIntegrationToken,
  saveIntegrationToken,
} from "@/lib/integrations/token-repository";

import type { IntegrationToken } from "@/lib/integrations/token-types";

const TOKEN_URL = "https://app.endorphinsrunning.com/oauth/token";

// Refresh one minute before the access token expires.
const EXPIRATION_BUFFER_MS = 60 * 1000;

interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type?: string;
  expires_in: number;
  scope?: string;
}

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function isValidTokenResponse(
  value: unknown,
): value is RefreshTokenResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const token = value as Record<string, unknown>;

  return (
    typeof token.access_token === "string" &&
    token.access_token.length > 0 &&
    typeof token.refresh_token === "string" &&
    token.refresh_token.length > 0 &&
    typeof token.expires_in === "number" &&
    Number.isFinite(token.expires_in) &&
    token.expires_in > 0 &&
    (token.token_type === undefined ||
      typeof token.token_type === "string") &&
    (token.scope === undefined || typeof token.scope === "string")
  );
}

function isAccessTokenValid(token: IntegrationToken): boolean {
  const expiresAt = Date.parse(token.expiresAt);

  if (!Number.isFinite(expiresAt)) {
    return false;
  }

  return expiresAt - Date.now() > EXPIRATION_BUFFER_MS;
}

async function refreshAccessToken(
  currentToken: IntegrationToken,
): Promise<IntegrationToken> {
  const clientId = getRequiredEnv("ENDORPHINS_CLIENT_ID");
  const clientSecret = getRequiredEnv("ENDORPHINS_CLIENT_SECRET");

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: currentToken.refreshToken,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `Endorphins token refresh failed with status ${response.status}`,
    );
  }

  const responseData: unknown = await response.json();

  if (!isValidTokenResponse(responseData)) {
    throw new Error("Endorphins returned an invalid refresh token response");
  }

  return {
    accessToken: responseData.access_token,
    refreshToken: responseData.refresh_token,
    tokenType:
      typeof responseData.token_type === "string"
        ? responseData.token_type
        : currentToken.tokenType,
    scope:
      typeof responseData.scope === "string"
        ? responseData.scope
        : currentToken.scope,
    expiresAt: new Date(
      Date.now() + responseData.expires_in * 1000,
    ).toISOString(),
  };
}

/**
 * Returns a usable Endorphins access token, refreshing it when necessary.
 */
export async function getEndorphinsAccessToken(): Promise<string> {
  const currentToken = await getIntegrationToken("endorphins");

  if (!currentToken) {
    throw new Error("Endorphins is not connected");
  }

  if (isAccessTokenValid(currentToken)) {
    return currentToken.accessToken;
  }

  const refreshedToken = await refreshAccessToken(currentToken);

  // Persist both tokens because the refresh token rotates.
  await saveIntegrationToken("endorphins", refreshedToken);

  return refreshedToken.accessToken;
}