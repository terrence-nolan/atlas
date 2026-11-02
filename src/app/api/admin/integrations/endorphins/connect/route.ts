import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/admin";
import {
  createOAuthState,
  createPkcePair,
} from "@/lib/integrations/endorphins/oauth";

const AUTHORIZE_URL =
  "https://app.endorphinsrunning.com/oauth/authorize";

const STATE_COOKIE = "endorphins_oauth_state";
const VERIFIER_COOKIE = "endorphins_pkce_verifier";

const OAUTH_COOKIE_MAX_AGE = 10 * 60; // 10 minutes

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export async function GET() {
  // Only the configured Atlas administrator can initiate OAuth.
  await requireAdmin();

  const clientId = getRequiredEnv("ENDORPHINS_CLIENT_ID");
  const redirectUri = getRequiredEnv("ENDORPHINS_REDIRECT_URI");

  const state = createOAuthState();
  const { codeVerifier, codeChallenge } = createPkcePair();

  const authorizationUrl = new URL(AUTHORIZE_URL);

  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("client_id", clientId);
  authorizationUrl.searchParams.set("redirect_uri", redirectUri);
  authorizationUrl.searchParams.set("scope", "read:workouts");
  authorizationUrl.searchParams.set("state", state);
  authorizationUrl.searchParams.set("code_challenge", codeChallenge);
  authorizationUrl.searchParams.set("code_challenge_method", "S256");

  const response = NextResponse.redirect(authorizationUrl);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/api/integrations/endorphins/callback",
    maxAge: OAUTH_COOKIE_MAX_AGE,
  };

  response.cookies.set(STATE_COOKIE, state, cookieOptions);
  response.cookies.set(VERIFIER_COOKIE, codeVerifier, cookieOptions);

  return response;
}