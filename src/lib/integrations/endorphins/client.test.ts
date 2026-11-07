import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getEndorphinsAccessToken } from "./token";
import { getEndorphinsActivities } from "./client";

vi.mock("./token", () => ({
  getEndorphinsAccessToken: vi.fn(),
}));

const fetchMock = vi.fn<typeof fetch>();

const activity = {
  _id: "activity-123",
  activity_id: "strava-456",
  activitySource: "STRAVA",
  name: "Morning Run",
  description: "",
  type: "Run",
  start_date: "2026-11-01T19:30:56.000Z",
  start_date_local: "2026-11-01T14:30:56.000Z",
  distance: 10000,
  distance_kilometers: 10,
  distance_miles: 6.2137,
  moving_time: 3000,
  elapsed_time: 3100,
  average_heartrate: 149.9,
  average_pace_per_km: "5:00",
  average_pace_per_mile: "8:03",
  total_elevation_gain: 100,
  calories: 600,
  privacy: {
    isPrivate: false,
    hideGeoData: false,
    hideHeartRate: false,
    hideSplits: false,
    hideFlashScore: false,
    visibility: "followers",
    hideEndDistance: null,
    hideStartDistance: null,
    hideStartEndDistance: null,
  },
};

describe("getEndorphinsActivities", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();

    vi.mocked(getEndorphinsAccessToken).mockResolvedValue(
      "test-access-token",
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it("retrieves activities using the default 120-day history", async () => {
    fetchMock.mockResolvedValue(
      Response.json({ activities: [activity] }),
    );

    const activities = await getEndorphinsActivities();

    expect(activities).toEqual([activity]);
    expect(getEndorphinsAccessToken).toHaveBeenCalledOnce();

    expect(fetchMock).toHaveBeenCalledOnce();

    const [url, options] = fetchMock.mock.calls[0];

    expect(url).toBeInstanceOf(URL);
    expect(url.toString()).toBe(
      "https://endorphinsrunning.com/gpt/activities?days=120",
    );
    expect(options?.headers).toMatchObject({
      Authorization: "Bearer test-access-token",
      Accept: "application/json",
    });
    expect(options?.cache).toBe("no-store");
  });

  it("supports a custom history window", async () => {
    fetchMock.mockResolvedValue(
      Response.json({ activities: [] }),
    );

    await getEndorphinsActivities(30);

    const [url, options] = fetchMock.mock.calls[0];

    expect(url).toBeInstanceOf(URL);
    expect(url.toString()).toBe(
      "https://endorphinsrunning.com/gpt/activities?days=30",
    );
    expect(options?.method).toBe("GET");
    expect(options?.cache).toBe("no-store");
  });

  it("rejects invalid history windows", async () => {
    await expect(getEndorphinsActivities(0)).rejects.toThrow(
      "Activity history must be between 1 and 365 days",
    );

    await expect(getEndorphinsActivities(366)).rejects.toThrow(
      "Activity history must be between 1 and 365 days",
    );

    await expect(getEndorphinsActivities(1.5)).rejects.toThrow(
      "Activity history must be between 1 and 365 days",
    );

    expect(getEndorphinsAccessToken).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("throws when the provider request fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    
    fetchMock.mockResolvedValue(
      new Response(null, { status: 401 }),
    );

    await expect(getEndorphinsActivities()).rejects.toThrow(
      "Endorphins activities request failed with status 401",
    );
  });

  it("throws when the response does not contain an activities array", async () => {
    fetchMock.mockResolvedValue(
      Response.json({ data: [] }),
    );

    await expect(getEndorphinsActivities()).rejects.toThrow(
      "Endorphins returned an invalid activities response",
    );
  });

  it("throws when an activity is missing required fields", async () => {
    const invalidActivity = {
      ...activity,
      _id: undefined,
    };

    fetchMock.mockResolvedValue(
      Response.json({ activities: [invalidActivity] }),
    );

    await expect(getEndorphinsActivities()).rejects.toThrow(
      "Endorphins returned an invalid activity",
    );
  });

  it("returns an empty array when no activities are available", async () => {
    fetchMock.mockResolvedValue(
      Response.json({ activities: [] }),
    );

    await expect(getEndorphinsActivities()).resolves.toEqual([]);
  });
});