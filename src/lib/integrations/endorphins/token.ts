
import "server-only";

import { randomUUID } from "node:crypto";

import {
  acquireTokenRefreshLock,
  getIntegrationToken,
  releaseTokenRefreshLock,
  saveRefreshedIntegrationToken,
} from "@/lib/integrations/token-repository";

import type { IntegrationToken } from "@/lib/integrations/token-types";

const TOKEN_URL = "https://app.endorphinsrunning.com/oauth/token";

// Refresh five minutes before the access token expires.
const EXPIRATION_BUFFER_MS = 60 * 5 * 1000;

// Keep the external request significantly shorter than the lock lease.
const REFRESH_TIMEOUT_MS = 15_000;
const LOCK_WAIT_TIMEOUT_MS = 25_000;
const LOCK_POLL_INTERVAL_MS = 300;

interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type?: string;
  expires_in: number;
  scope?: string;
}

interface GetAccessTokenOptions {
  forceRefresh?: boolean;
  rejectedAccessToken?: string;
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
    signal: AbortSignal.timeout(REFRESH_TIMEOUT_MS),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);

    const errorCode =
      typeof errorBody?.error === "string"
        ? errorBody.error
        : "unknown_error";

    console.error("Endorphins token refresh failed:", {
      status: response.status,
      error: errorCode,
    });

    if (errorCode === "invalid_grant") {
      throw new Error(
        "Endorphins refresh token is no longer valid. Please reconnect Endorphins.",
      );
    }

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
    tokenType: responseData.token_type ?? currentToken.tokenType,
    scope: responseData.scope ?? currentToken.scope,
    expiresAt: new Date(
      Date.now() + responseData.expires_in * 1000,
    ).toISOString(),
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


async function refreshWithLock(
  currentToken: IntegrationToken,
  lockId: string,
  rejectedAccessToken?: string,
): Promise<string> {
  try {
    // Re-read after acquiring the lock. The token may have changed
    // between our previous read and acquiring ownership.
    const latestToken = await getIntegrationToken("endorphins");

    if (!latestToken) {
      throw new Error("Endorphins is no longer connected");
    }

    if (isAccessTokenValid(latestToken)) {
      if (!rejectedAccessToken) {
        return latestToken.accessToken;
      }

      if (latestToken.accessToken !== rejectedAccessToken) {
        return latestToken.accessToken;
      }
    }

    const refreshedToken = await refreshAccessToken(latestToken);

    await saveRefreshedIntegrationToken(
      "endorphins",
      refreshedToken,
      lockId,
    );

    return refreshedToken.accessToken;
  } finally {
    try {
      const released = await releaseTokenRefreshLock(
        "endorphins",
        lockId,
      );

      if (!released) {
        console.warn(
          "Endorphins refresh lock was no longer owned at release",
        );
      }
    } catch (error) {
      console.error("Failed to release Endorphins refresh lock:", error);
    }
  }
}

async function waitForRefreshedToken(
  originalToken: IntegrationToken,
  lockId: string,
  rejectedAccessToken?: string,
): Promise<string> {
  const deadline = Date.now() + LOCK_WAIT_TIMEOUT_MS;

  while (Date.now() < deadline) {
    await sleep(LOCK_POLL_INTERVAL_MS);

    const latestToken = await getIntegrationToken("endorphins");

    if (!latestToken) {
      throw new Error("Endorphins is no longer connected");
    }

    // Another request may have successfully refreshed the token.
    if (isAccessTokenValid(latestToken)) {
      if (!rejectedAccessToken) {
        return latestToken.accessToken;
      }

      if (latestToken.accessToken !== rejectedAccessToken) {
        return latestToken.accessToken;
      }
    }

    // If the lock holder crashed, the database will allow us
    // to acquire the lock once its lease expires.
    const acquired = await acquireTokenRefreshLock(
      "endorphins",
      lockId,
    );

    if (acquired) {
      return refreshWithLock(latestToken, lockId, rejectedAccessToken);
    }
  }

  throw new Error(
    "Timed out waiting for another request to refresh the Endorphins token",
  );
}


/**
 * Returns a usable Endorphins access token, refreshing it when necessary.
 *
 * A database-backed lock ensures only one request refreshes the rotating
 * refresh token at a time, even across separate server instances.
 */
export async function getEndorphinsAccessToken(
  options: GetAccessTokenOptions = {},
): Promise<string> {
  const {
    forceRefresh = false,
    rejectedAccessToken,
  } = options;

  const currentToken = await getIntegrationToken("endorphins");

  if (!currentToken) {
    throw new Error("Endorphins is not connected");
  }

  if (!forceRefresh && isAccessTokenValid(currentToken)) {
    return currentToken.accessToken;
  }

  // If this is a forced refresh, remember which access token was rejected.
  const rejectedToken = forceRefresh
    ? (rejectedAccessToken ?? currentToken.accessToken)
    : undefined;

  // Generate a unique ID to identify this lock owner.
  const lockId = randomUUID();

  const acquired = await acquireTokenRefreshLock("endorphins", lockId);

  if (!acquired) {
    return waitForRefreshedToken(
      currentToken,
      lockId,
      rejectedToken,
    );
  }

  return refreshWithLock(currentToken, lockId, rejectedToken);
}
