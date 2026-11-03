import { describe, expect, it } from "vitest";

import {
  createCodeChallenge,
  createOAuthState,
  createPkcePair,
} from "./oauth";

describe("Endorphins OAuth utilities", () => {
  describe("createOAuthState", () => {
    it("generates a URL-safe state value", () => {
      const state = createOAuthState();

      expect(state).toMatch(/^[A-Za-z0-9_-]+$/);
      expect(state).toHaveLength(43);
    });

    it("generates a different value each time", () => {
      expect(createOAuthState()).not.toBe(createOAuthState());
    });
  });

  describe("createPkcePair", () => {
    it("generates a URL-safe verifier and challenge", () => {
      const { codeVerifier, codeChallenge } = createPkcePair();

      expect(codeVerifier).toMatch(/^[A-Za-z0-9_-]+$/);
      expect(codeChallenge).toMatch(/^[A-Za-z0-9_-]+$/);

      expect(codeVerifier).toHaveLength(43);
      expect(codeChallenge).toHaveLength(43);
    });

    it("generates a different verifier each time", () => {
      expect(createPkcePair().codeVerifier).not.toBe(
        createPkcePair().codeVerifier,
      );
    });

    it("generates the correct S256 challenge", () => {
      // RFC 7636 test vector.
      const verifier =
        "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";

      expect(createCodeChallenge(verifier)).toBe(
        "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
      );
    });
  });
});