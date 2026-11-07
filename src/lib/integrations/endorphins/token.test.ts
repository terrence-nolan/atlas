import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  getIntegrationToken,
  saveIntegrationToken,
} from "@/lib/integrations/token-repository";

import type { IntegrationToken } from "@/lib/integrations/token-types";

import {
  getEndorphinsAccessToken,
} from "./token";

vi.mock("@/lib/integrations/token-repository", () => ({
  getIntegrationToken: vi.fn(),
  saveIntegrationToken: vi.fn(),
}));

const TEST_CLIENT_ID = "test-client-id";
const TEST_CLIENT_SECRET = "test-client-secret";

const currentToken: IntegrationToken = {
  accessToken: "current-access-token",
  refreshToken: "current-refresh-token",
  tokenType: "Bearer",
  scope: "read:workouts",
  expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
};

const fetchMock = vi.fn();

describe("getEndorphinsAccessToken", () => {
  beforeEach(() => {
    vi.stubEnv("ENDORPHINS_CLIENT_ID", TEST_CLIENT_ID);
    vi.stubEnv("ENDORPHINS_CLIENT_SECRET", TEST_CLIENT_SECRET);

    vi.stubGlobal("fetch", fetchMock);

    fetchMock.mockReset();

    vi.mocked(getIntegrationToken).mockResolvedValue(currentToken);
    vi.mocked(saveIntegrationToken).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("returns the existing access token when it is still valid", async () => {
    const accessToken = await getEndorphinsAccessToken();

    expect(accessToken).toBe("current-access-token");
    expect(getIntegrationToken).toHaveBeenCalledWith("endorphins");
    expect(saveIntegrationToken).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("refreshes and saves tokens when the access token is expired", async () => {
    const expiredToken = {
      ...currentToken,
      expiresAt: new Date(Date.now() - 1000).toISOString(),
    };

    vi.mocked(getIntegrationToken)
      .mockResolvedValueOnce(expiredToken)
      .mockResolvedValueOnce(expiredToken);

    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          access_token: "new-access-token",
          refresh_token: "new-refresh-token",
          token_type: "Bearer",
          expires_in: 3600,
          scope: "read:workouts",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      ),
    );

    const beforeRefresh = Date.now();
    const accessToken = await getEndorphinsAccessToken();

    expect(accessToken).toBe("new-access-token");

    expect(getIntegrationToken).toHaveBeenCalledTimes(2);

    expect(fetchMock).toHaveBeenCalledWith(
      "https://app.endorphinsrunning.com/oauth/token",
      expect.objectContaining({
        method: "POST",
        cache: "no-store",
      }),
    );

    const requestOptions = fetchMock.mock.calls[0]?.[1];
    const body = requestOptions?.body as URLSearchParams;

    expect(body.get("grant_type")).toBe("refresh_token");
    expect(body.get("client_id")).toBe(TEST_CLIENT_ID);
    expect(body.get("client_secret")).toBe(TEST_CLIENT_SECRET);
    expect(body.get("refresh_token")).toBe("current-refresh-token");

    expect(saveIntegrationToken).toHaveBeenCalledOnce();

    const [provider, savedToken] =
      vi.mocked(saveIntegrationToken).mock.calls[0];

    expect(provider).toBe("endorphins");
    expect(savedToken).toMatchObject({
      accessToken: "new-access-token",
      refreshToken: "new-refresh-token",
      tokenType: "Bearer",
      scope: "read:workouts",
    });

    const savedExpiry = Date.parse(savedToken.expiresAt);

    expect(savedExpiry).toBeGreaterThanOrEqual(
      beforeRefresh + 3599 * 1000,
    );
    expect(savedExpiry).toBeLessThanOrEqual(
      Date.now() + 3600 * 1000,
    );
  });

  it("throws when Endorphins is not connected", async () => {
    vi.mocked(getIntegrationToken).mockResolvedValue(null);

    await expect(getEndorphinsAccessToken()).rejects.toThrow(
      "Endorphins is not connected",
    );

    expect(fetchMock).not.toHaveBeenCalled();
    expect(saveIntegrationToken).not.toHaveBeenCalled();
  });

  it("throws when the refresh request fails", async () => {
    vi.mocked(getIntegrationToken).mockResolvedValue({
      ...currentToken,
      expiresAt: new Date(Date.now() - 1000).toISOString(),
    });

    fetchMock.mockResolvedValue(new Response(null, { status: 400 }));

    await expect(getEndorphinsAccessToken()).rejects.toThrow(
      "Endorphins token refresh failed with status 400",
    );

    expect(saveIntegrationToken).not.toHaveBeenCalled();
  });

  it("forces a refresh even when the access token is still valid", async () => {
    fetchMock.mockResolvedValue(
      Response.json({
        access_token: "new-access-token",
        refresh_token: "new-refresh-token",
        token_type: "Bearer",
        expires_in: 3600,
        scope: "read:workouts",
      }),
    );

    const accessToken = await getEndorphinsAccessToken({
      forceRefresh: true,
    });

    expect(accessToken).toBe("new-access-token");
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(getIntegrationToken).toHaveBeenCalledTimes(2);
    expect(saveIntegrationToken).toHaveBeenCalledOnce();
  });

  it("uses updated credentials when another request already refreshed the token", async () => {
    const expiredToken = {
      ...currentToken,
      expiresAt: new Date(Date.now() - 1000).toISOString(),
    };

    const updatedToken: IntegrationToken = {
      accessToken: "updated-access-token",
      refreshToken: "updated-refresh-token",
      tokenType: "Bearer",
      scope: "read:workouts",
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    };

    vi.mocked(getIntegrationToken)
      .mockResolvedValueOnce(expiredToken)
      .mockResolvedValueOnce(updatedToken);

    const accessToken = await getEndorphinsAccessToken();

    expect(accessToken).toBe("updated-access-token");
    expect(fetchMock).not.toHaveBeenCalled();
    expect(saveIntegrationToken).not.toHaveBeenCalled();
    expect(getIntegrationToken).toHaveBeenCalledTimes(2);
  });

  it("retains the existing refresh token when the refresh response omits one", async () => {
    const expiredToken = {
      ...currentToken,
      expiresAt: new Date(Date.now() - 1000).toISOString(),
    };

    vi.mocked(getIntegrationToken).mockResolvedValue(expiredToken);

    fetchMock.mockResolvedValue(
      Response.json({
        access_token: "new-access-token",
        expires_in: 3600,
      }),
    );

    const accessToken = await getEndorphinsAccessToken();

    expect(accessToken).toBe("new-access-token");

    const [, savedToken] =
      vi.mocked(saveIntegrationToken).mock.calls[0];

    expect(savedToken.refreshToken).toBe("current-refresh-token");
  });

  it("uses updated credentials when a concurrent refresh succeeds", async () => {
    const expiredToken = {
      ...currentToken,
      expiresAt: new Date(Date.now() - 1000).toISOString(),
    };

    const updatedToken: IntegrationToken = {
      accessToken: "updated-access-token",
      refreshToken: "updated-refresh-token",
      tokenType: "Bearer",
      scope: "read:workouts",
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    };

    vi.mocked(getIntegrationToken)
      .mockResolvedValueOnce(expiredToken)
      .mockResolvedValueOnce(expiredToken)
      .mockResolvedValueOnce(updatedToken);

    fetchMock.mockResolvedValue(
      new Response(null, { status: 400 }),
    );

    const accessToken = await getEndorphinsAccessToken();

    expect(accessToken).toBe("updated-access-token");
    expect(getIntegrationToken).toHaveBeenCalledTimes(3);
    expect(saveIntegrationToken).not.toHaveBeenCalled();
  });
});
