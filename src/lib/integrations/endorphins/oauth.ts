import "server-only";

import { createHash, randomBytes } from "node:crypto";

const RANDOM_BYTES_LENGTH = 32;

export interface PkcePair {
  codeVerifier: string;
  codeChallenge: string;
}

/**
 * Generates a cryptographically random OAuth state value.
 */
export function createOAuthState(): string {
  return randomBytes(RANDOM_BYTES_LENGTH).toString("base64url");
}

/**
 * Creates a PKCE verifier and its S256 challenge.
 */
export function createPkcePair(): PkcePair {
  const codeVerifier = randomBytes(RANDOM_BYTES_LENGTH).toString("base64url");

  return {
    codeVerifier,
    codeChallenge: createCodeChallenge(codeVerifier),
  };
}

/**
 * Converts a PKCE verifier into an S256 challenge.
 */
export function createCodeChallenge(codeVerifier: string): string {
  return createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");
}