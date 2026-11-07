import "server-only";

import {
  getIntegrationToken,
  saveIntegrationToken,
} from "@/lib/integrations/token-repository";

import type { IntegrationToken } from "@/lib/integrations/token-types";

const TOKEN_URL = "https://app.endorphinsrunning.com/oauth/token";

// Refresh five minutes before the access token expires.
const EXPIRATION_BUFFER_MS = 60 * 5 * 1000;

interface RefreshTokenResponse {
  access_token: string;
  refresh_token?: string;
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
    (token.refresh_token === undefined ||
      (typeof token.refresh_token === "string" &&
        token.refresh_token.length > 0)) &&
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
    refreshToken: responseData.refresh_token ?? currentToken.refreshToken,
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

function isTokenUpdated(
  originalToken: IntegrationToken,
  latestToken: IntegrationToken,
): boolean {
  return (
    originalToken.accessToken !== latestToken.accessToken ||
    originalToken.refreshToken !== latestToken.refreshToken
  );
}

/**
 * Returns a usable Endorphins access token, refreshing it when necessary.
 */
export async function getEndorphinsAccessToken(
  options: { forceRefresh?: boolean } = {},
): Promise<string> {
  const { forceRefresh = false } = options;

  const currentToken = await getIntegrationToken("endorphins");

  if (!currentToken) {
    throw new Error("Endorphins is not connected");
  }

  if (!forceRefresh && isAccessTokenValid(currentToken)) {
    return currentToken.accessToken;
  }

  const latestToken = await getIntegrationToken("endorphins");

  if (!latestToken) {
    throw new Error("Endorphins is not connected");
  }

  // Another request may have already refreshed the credentials.
  if (
    isTokenUpdated(currentToken, latestToken) &&
    isAccessTokenValid(latestToken)
  ) {
    return latestToken.accessToken;
  }

  try {
    const refreshedToken = await refreshAccessToken(latestToken);

    await saveIntegrationToken("endorphins", refreshedToken);

    return refreshedToken.accessToken;
  } catch (error) {
    // Another request may have refreshed the token while this
    // request was attempting its own refresh.
    const updatedToken = await getIntegrationToken("endorphins");

    if (
      updatedToken &&
      isTokenUpdated(latestToken, updatedToken) &&
      isAccessTokenValid(updatedToken)
    ) {
      return updatedToken.accessToken;
    }

    throw error;
  }
}
