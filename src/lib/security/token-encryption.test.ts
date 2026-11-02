
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { decryptToken, encryptToken } from "./token-encryption";

const TEST_KEY = "a".repeat(64);
const DIFFERENT_KEY = "b".repeat(64);

describe("token encryption", () => {
  beforeEach(() => {
    vi.stubEnv("TOKEN_ENCRYPTION_KEY", TEST_KEY);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("encrypts and decrypts a token", () => {
    const token = "test-access-token";

    const encrypted = encryptToken(token);
    const decrypted = decryptToken(encrypted);

    expect(encrypted).not.toBe(token);
    expect(decrypted).toBe(token);
  });

  it("produces different ciphertext for the same token", () => {
    const token = "test-access-token";

    const firstEncryption = encryptToken(token);
    const secondEncryption = encryptToken(token);

    expect(firstEncryption).not.toBe(secondEncryption);

    expect(decryptToken(firstEncryption)).toBe(token);
    expect(decryptToken(secondEncryption)).toBe(token);
  });

  it("rejects an empty token", () => {
    expect(() => encryptToken("")).toThrow(
      "Cannot encrypt an empty token",
    );
  });

  it("rejects an invalid encryption key", () => {
    vi.stubEnv("TOKEN_ENCRYPTION_KEY", "invalid");

    expect(() => encryptToken("test-token")).toThrow(
      "TOKEN_ENCRYPTION_KEY must be a 64-character hexadecimal string",
    );
  });

  it("rejects malformed encrypted data", () => {
    expect(() => decryptToken("invalid-data")).toThrow(
      "Invalid encrypted token format",
    );
  });

  it("rejects ciphertext encrypted with a different key", () => {
    const encrypted = encryptToken("test-access-token");

    vi.stubEnv("TOKEN_ENCRYPTION_KEY", DIFFERENT_KEY);

    expect(() => decryptToken(encrypted)).toThrow();
  });

  it("rejects tampered ciphertext", () => {
    const encrypted = encryptToken("test-access-token");
    const parts = encrypted.split(".");

    // Modify the ciphertext while preserving its format.
    const ciphertext = Buffer.from(parts[3], "base64url");
    ciphertext[0] ^= 1;
    parts[3] = ciphertext.toString("base64url");

    expect(() => decryptToken(parts.join("."))).toThrow();
  });
});
