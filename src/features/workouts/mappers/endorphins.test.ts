import { describe, expect, it } from "vitest";

import type { EndorphinsActivity } from "@/lib/integrations/endorphins/types";
import { mapEndorphinsActivity } from "./endorphins";

const createActivity = (
  overrides: Partial<EndorphinsActivity> = {},
): EndorphinsActivity => ({
  _id: "activity-123",
  activity_id: "external-123",
  activitySource: "STRAVA",
  name: "Morning Run",
  type: "Run",
  start_date: "2026-11-02T12:00:00.000Z",
  start_date_local: "2026-11-02T08:00:00",
  distance: 10000,
  distance_kilometers: 10,
  distance_miles: 6.2137,
  moving_time: 3000,
  elapsed_time: 3200,
  average_heartrate: 150,
  average_pace_per_km: "5:00",
  average_pace_per_mile: "8:03",
  total_elevation_gain: 100,
  calories: 650,
  privacy: {
    isPrivate: false,
    hideGeoData: false,
    hideHeartRate: false,
    hideSplits: false,
    hideFlashScore: false,
    visibility: "followers",
    hideEndDistance: false,
    hideStartDistance: false,
    hideStartEndDistance: false,
  },
  ...overrides,
});

describe("mapEndorphinsActivity", () => {
  it("maps an Endorphins activity to a workout", () => {
    const activity = createActivity();

    expect(mapEndorphinsActivity(activity)).toEqual({
      id: "activity-123",
      name: "Morning Run",
      type: "run",
      startedAt: "2026-11-02T12:00:00.000Z",
      distanceMeters: 10000,
      movingTimeSeconds: 3000,
      elapsedTimeSeconds: 3200,
      averageHeartRate: 150,
      averagePacePerKilometer: "5:00",
      averagePacePerMile: "8:03",
      calories: 650,
      source: "STRAVA",
    });
  });

  it("returns null for private activities", () => {
    const activity = createActivity({
      privacy: {
        ...createActivity().privacy,
        isPrivate: true,
      },
    });

    expect(mapEndorphinsActivity(activity)).toBeNull();
  });

  it("hides heart rate when the activity's privacy settings require it", () => {
    const activity = createActivity({
      privacy: {
        ...createActivity().privacy,
        hideHeartRate: true,
      },
    });

    expect(mapEndorphinsActivity(activity)?.averageHeartRate).toBeNull();
  });

  it("maps missing optional fields to null", () => {
    const activity = createActivity({
      average_heartrate: undefined,
      average_pace_per_km: undefined,
      average_pace_per_mile: undefined,
      calories: undefined,
    });

    const workout = mapEndorphinsActivity(activity);

    expect(workout).toMatchObject({
      averageHeartRate: null,
      averagePacePerKilometer: null,
      averagePacePerMile: null,
      calories: null,
    });
  });

  it.each([
    ["Run", "run"],
    ["Walk", "walk"],
    ["Ride", "ride"],
    ["Cycling", "ride"],
    ["VirtualRide", "ride"],
    ["Swim", "swim"],
    ["Row", "row"],
    ["Rowing", "row"],
    ["UnknownActivity", "other"],
  ] as const)("maps activity type %s to %s", (providerType, expectedType) => {
    const activity = createActivity({ type: providerType });

    expect(mapEndorphinsActivity(activity)?.type).toBe(expectedType);
  });
});