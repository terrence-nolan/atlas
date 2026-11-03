import { timingSafeEqual } from "node:crypto";

import { NextRequest, NextResponse } from "next/server";

import { saveIntegrationToken } from "@/lib/integrations/token-repository";

const TOKEN_URL = "https://app.endorphinsrunning.com/oauth/token";

const STATE_COOKIE = "endorphins_oauth_state";
const VERIFIER_COOKIE = "endorphins_pkce_verifier";
const CALLBACK_PATH = "/api/integrations/endorphins/callback";

interface TokenResponse {
  access_token?: unknown;
  refresh_token?: unknown;
  token_type?: unknown;
  expires_in?: unknown;
  scope?: unknown;
}

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function statesMatch(received: string, expected: string): boolean {
  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);

  return (
    receivedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(receivedBuffer, expectedBuffer)
  );
}

function clearOAuthCookies(response: NextResponse): void {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: CALLBACK_PATH,
    maxAge: 0,
  };

  response.cookies.set(STATE_COOKIE, "", cookieOptions);
  response.cookies.set(VERIFIER_COOKIE, "", cookieOptions);
}

function redirectToAdmin(
  request: NextRequest,
  status: "connected" | "error",
): NextResponse {
  const response = NextResponse.redirect(
    new URL(`/admin?endorphins=${status}`, request.url),
  );

  clearOAuthCookies(response);

  return response;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const receivedState = searchParams.get("state");
  const expectedState = request.cookies.get(STATE_COOKIE)?.value;
  const codeVerifier = request.cookies.get(VERIFIER_COOKIE)?.value;

  if (
    !receivedState ||
    !expectedState ||
    !codeVerifier ||
    !statesMatch(receivedState, expectedState)
  ) {
    return new NextResponse("Invalid OAuth state or missing PKCE verifier.", {
      status: 400,
    });
  }

  // The state is valid, so it is now safe to handle provider errors.
  if (searchParams.has("error")) {
    return redirectToAdmin(request, "error");
  }

  const code = searchParams.get("code");

  if (!code) {
    return redirectToAdmin(request, "error");
  }

let stage = "configuration";

  try {
    const clientId = getRequiredEnv("ENDORPHINS_CLIENT_ID");
    const clientSecret = getRequiredEnv("ENDORPHINS_CLIENT_SECRET");
    const redirectUri = getRequiredEnv("ENDORPHINS_REDIRECT_URI");

    stage = "token_exchange";

    const tokenResponse = await fetch(TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }),
      cache: "no-store",
    });

    if (!tokenResponse.ok) {
      const errorBody = (await tokenResponse.json().catch(() => null)) as {
        error?: unknown;
        error_description?: unknown;
      } | null;

      console.error("Endorphins token exchange rejected", {
        status: tokenResponse.status,
        error:
          typeof errorBody?.error === "string"
            ? errorBody.error
            : "Unknown OAuth error",
        description:
          typeof errorBody?.error_description === "string"
            ? errorBody.error_description.slice(0, 300)
            : undefined,
      });

      return redirectToAdmin(request, "error");
    }

    stage = "token_response_validation";

    const tokenData = (await tokenResponse.json()) as TokenResponse;

    if (
      typeof tokenData.access_token !== "string" ||
      typeof tokenData.refresh_token !== "string" ||
      typeof tokenData.expires_in !== "number" ||
      !Number.isFinite(tokenData.expires_in) ||
      tokenData.expires_in <= 0
    ) {
      return redirectToAdmin(request, "error");
    }

    const expiresAt = new Date(
      Date.now() + tokenData.expires_in * 1000,
    ).toISOString();

    stage = "token_persistence";

    await saveIntegrationToken("endorphins", {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      tokenType:
        typeof tokenData.token_type === "string"
          ? tokenData.token_type
          : "Bearer",
      scope:
        typeof tokenData.scope === "string"
          ? tokenData.scope
          : "read:workouts",
      expiresAt,
    });

    return redirectToAdmin(request, "connected");
  } catch (error) {
  console.error("Endorphins OAuth callback failed", {
    stage,
    message: error instanceof Error ? error.message : "Unknown error",
  });

  return redirectToAdmin(request, "error");
}
}