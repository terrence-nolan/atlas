import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { decryptToken, encryptToken } from "@/lib/security/token-encryption";

import {
  acquireTokenRefreshLock,
  deleteIntegrationToken,
  getIntegrationToken,
  releaseTokenRefreshLock,
  saveIntegrationToken,
  saveRefreshedIntegrationToken,
} from "./token-repository";

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  rpc: vi.fn(),
  maybeSingle: vi.fn(),
  upsert: vi.fn(),
  deleteEq: vi.fn(),
  update: vi.fn(),
  updateProviderEq: vi.fn(),
  updateLockEq: vi.fn(),
  updateSelect: vi.fn(),
  updateMaybeSingle: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  getSupabaseAdmin: () => ({
    from: mocks.from,
    rpc: mocks.rpc,
  }),
}));

const TEST_KEY = "a".repeat(64);
const LOCK_ID = "123e4567-e89b-12d3-a456-426614174000";

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
      update: mocks.update,
    });

    mocks.update.mockReturnValue({
      eq: mocks.updateProviderEq,
    });

    mocks.updateProviderEq.mockReturnValue({
      eq: mocks.updateLockEq,
    });

    mocks.updateLockEq.mockReturnValue({
      select: mocks.updateSelect,
    });

    mocks.updateSelect.mockReturnValue({
      maybeSingle: mocks.updateMaybeSingle,
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
      mocks.maybeSingle.mockResolvedValue({
        data: null,
        error: new Error("Database unavailable"),
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

  describe("acquireTokenRefreshLock", () => {
    it("returns true when the lock is acquired", async () => {
      mocks.rpc.mockResolvedValue({
        data: true,
        error: null,
      });

      await expect(
        acquireTokenRefreshLock("endorphins", LOCK_ID),
      ).resolves.toBe(true);

      expect(mocks.rpc).toHaveBeenCalledWith(
        "acquire_token_refresh_lock",
        {
          p_provider: "endorphins",
          p_lock_id: LOCK_ID,
          p_lease_seconds: 120,
        },
      );
    });

    it("returns false when the lock is already held", async () => {
      mocks.rpc.mockResolvedValue({
        data: false,
        error: null,
      });

      await expect(
        acquireTokenRefreshLock("endorphins", LOCK_ID),
      ).resolves.toBe(false);
    });

    it("throws when the lock acquisition fails", async () => {
      mocks.rpc.mockResolvedValue({
        data: null,
        error: new Error("Lock acquisition failed"),
      });

      await expect(
        acquireTokenRefreshLock("endorphins", LOCK_ID),
      ).rejects.toThrow("Lock acquisition failed");
    });
  });

  describe("releaseTokenRefreshLock", () => {
    it("returns true when the lock is released", async () => {
      mocks.rpc.mockResolvedValue({
        data: true,
        error: null,
      });

      await expect(
        releaseTokenRefreshLock("endorphins", LOCK_ID),
      ).resolves.toBe(true);

      expect(mocks.rpc).toHaveBeenCalledWith(
        "release_token_refresh_lock",
        {
          p_provider: "endorphins",
          p_lock_id: LOCK_ID,
        },
      );
    });

    it("returns false when the lock ID does not match", async () => {
      mocks.rpc.mockResolvedValue({
        data: false,
        error: null,
      });

      await expect(
        releaseTokenRefreshLock("endorphins", LOCK_ID),
      ).resolves.toBe(false);
    });

    it("throws when the lock release fails", async () => {
      mocks.rpc.mockResolvedValue({
        data: null,
        error: new Error("Lock release failed"),
      });

      await expect(
        releaseTokenRefreshLock("endorphins", LOCK_ID),
      ).rejects.toThrow("Lock release failed");
    });
  });

  describe("saveRefreshedIntegrationToken", () => {
    it("encrypts and saves the token only when the caller owns the lock", async () => {
      mocks.updateMaybeSingle.mockResolvedValue({
        data: { provider: "endorphins" },
        error: null,
      });

      await expect(
        saveRefreshedIntegrationToken("endorphins", token, LOCK_ID),
      ).resolves.toBeUndefined();

      expect(mocks.from).toHaveBeenCalledWith("integration_tokens");
      expect(mocks.update).toHaveBeenCalledOnce();

      const [payload] = mocks.update.mock.calls[0];

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

      expect(mocks.updateProviderEq).toHaveBeenCalledWith(
        "provider",
        "endorphins",
      );
      expect(mocks.updateLockEq).toHaveBeenCalledWith(
        "refresh_lock_id",
        LOCK_ID,
      );
      expect(mocks.updateSelect).toHaveBeenCalledWith("provider");
      expect(mocks.updateMaybeSingle).toHaveBeenCalledOnce();
    });

    it("throws when the database update fails", async () => {
      mocks.updateMaybeSingle.mockResolvedValue({
        data: null,
        error: new Error("Database update failed"),
      });

      await expect(
        saveRefreshedIntegrationToken("endorphins", token, LOCK_ID),
      ).rejects.toThrow("Database update failed");
    });

    it("throws when the caller no longer owns the lock", async () => {
      mocks.updateMaybeSingle.mockResolvedValue({
        data: null,
        error: null,
      });

      await expect(
        saveRefreshedIntegrationToken("endorphins", token, LOCK_ID),
      ).rejects.toThrow();
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
