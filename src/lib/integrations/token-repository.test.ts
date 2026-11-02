import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { decryptToken, encryptToken } from "@/lib/security/token-encryption";

import {
  deleteIntegrationToken,
  getIntegrationToken,
  saveIntegrationToken,
} from "./token-repository";

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  maybeSingle: vi.fn(),
  upsert: vi.fn(),
  deleteEq: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  getSupabaseAdmin: () => ({
    from: mocks.from,
  }),
}));

const TEST_KEY = "a".repeat(64);

const token = {
  accessToken: "test-access-token",
  refreshToken: "test-refresh-token",
  tokenType: "Bearer",
  scope: "read:workouts",
  expiresAt: "2026-11-03T12:00:00.000Z",
};

describe("integration token repository", () => {
  beforeEach(() => {
    vi.stubEnv("TOKEN_ENCRYPTION_KEY", TEST_KEY);

    mocks.from.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: mocks.maybeSingle,
        }),
      }),
      upsert: mocks.upsert,
      delete: vi.fn().mockReturnValue({
        eq: mocks.deleteEq,
      }),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  describe("getIntegrationToken", () => {
    it("returns null when no token exists", async () => {
      mocks.maybeSingle.mockResolvedValue({
        data: null,
        error: null,
      });

      await expect(getIntegrationToken("endorphins")).resolves.toBeNull();

      expect(mocks.from).toHaveBeenCalledWith("integration_tokens");
    });

    it("retrieves and decrypts a stored token", async () => {
      mocks.maybeSingle.mockResolvedValue({
        data: {
          access_token_encrypted: encryptToken(token.accessToken),
          refresh_token_encrypted: encryptToken(token.refreshToken),
          token_type: token.tokenType,
          scope: token.scope,
          expires_at: token.expiresAt,
        },
        error: null,
      });

      await expect(getIntegrationToken("endorphins")).resolves.toEqual(token);
    });

    it("throws when the database query fails", async () => {
      const databaseError = new Error("Database unavailable");

      mocks.maybeSingle.mockResolvedValue({
        data: null,
        error: databaseError,
      });

      await expect(getIntegrationToken("endorphins")).rejects.toThrow(
        "Database unavailable",
      );
    });
  });

  describe("saveIntegrationToken", () => {
    it("encrypts and saves the token", async () => {
      mocks.upsert.mockResolvedValue({
        error: null,
      });

      await saveIntegrationToken("endorphins", token);

      expect(mocks.from).toHaveBeenCalledWith("integration_tokens");
      expect(mocks.upsert).toHaveBeenCalledOnce();

      const [payload, options] = mocks.upsert.mock.calls[0];

      expect(payload.provider).toBe("endorphins");
      expect(payload.access_token_encrypted).not.toBe(token.accessToken);
      expect(payload.refresh_token_encrypted).not.toBe(token.refreshToken);

      expect(decryptToken(payload.access_token_encrypted)).toBe(
        token.accessToken,
      );
      expect(decryptToken(payload.refresh_token_encrypted)).toBe(
        token.refreshToken,
      );

      expect(payload.token_type).toBe(token.tokenType);
      expect(payload.scope).toBe(token.scope);
      expect(payload.expires_at).toBe(token.expiresAt);
      expect(payload.updated_at).toBeDefined();

      expect(options).toEqual({
        onConflict: "provider",
      });
    });

    it("throws when the database write fails", async () => {
      mocks.upsert.mockResolvedValue({
        error: new Error("Database write failed"),
      });

      await expect(
        saveIntegrationToken("endorphins", token),
      ).rejects.toThrow("Database write failed");
    });
  });

  describe("deleteIntegrationToken", () => {
    it("deletes the provider token", async () => {
      mocks.deleteEq.mockResolvedValue({
        error: null,
      });

      await expect(
        deleteIntegrationToken("endorphins"),
      ).resolves.toBeUndefined();

      expect(mocks.from).toHaveBeenCalledWith("integration_tokens");
      expect(mocks.deleteEq).toHaveBeenCalledWith("provider", "endorphins");
    });

    it("throws when the database delete fails", async () => {
      mocks.deleteEq.mockResolvedValue({
        error: new Error("Database delete failed"),
      });

      await expect(
        deleteIntegrationToken("endorphins"),
      ).rejects.toThrow("Database delete failed");
    });
  });
});
