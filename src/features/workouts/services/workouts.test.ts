import { beforeEach, describe, expect, it, vi } from "vitest";

import { getEndorphinsActivities } from "@/lib/integrations/endorphins/client";
import { getLastWorkout, getWorkouts, getWorkoutStats } from "./workouts";

vi.mock("@/lib/integrations/endorphins/client", () => ({
  getEndorphinsActivities: vi.fn(),
}));

vi.mock("next/cache", () => ({
  cacheLife: vi.fn(),
}));

const createActivity = (id: string, isPrivate = false) => ({
  _id: id,
  activity_id: `external-${id}`,
  activitySource: "STRAVA",
  name: `Workout ${id}`,
  type: "Run",
  start_date: "2026-11-02T12:00:00.000Z",
  start_date_local: "2026-11-02T08:00:00",
  distance: 10000,
  distance_kilometers: 10,
  distance_miles: 6.2137,
  moving_time: 3000,
  elapsed_time: 3200,
  privacy: {
    isPrivate,
    hideGeoData: false,
    hideHeartRate: false,
    hideSplits: false,
    hideFlashScore: false,
    visibility: "followers",
    hideEndDistance: false,
    hideStartDistance: false,
    hideStartEndDistance: false,
  },
});

describe("getWorkouts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("retrieves and maps workouts", async () => {
    vi.mocked(getEndorphinsActivities).mockResolvedValue([
      createActivity("1"),
      createActivity("2"),
    ]);

    const workouts = await getWorkouts();

    expect(getEndorphinsActivities).toHaveBeenCalledWith(365);
    expect(workouts).toHaveLength(2);
    expect(workouts[0].id).toBe("1");
    expect(workouts[1].id).toBe("2");
  });

  it("excludes private activities", async () => {
    vi.mocked(getEndorphinsActivities).mockResolvedValue([
      createActivity("1"),
      createActivity("2", true),
    ]);

    const workouts = await getWorkouts();

    expect(workouts).toHaveLength(1);
    expect(workouts[0].id).toBe("1");
  });

  it("passes a custom history window to the API client", async () => {
    vi.mocked(getEndorphinsActivities).mockResolvedValue([
      createActivity("1"),
    ]);

    await getWorkouts({ days: 30 });

    expect(getEndorphinsActivities).toHaveBeenCalledWith(30);
  });

  it("limits the number of returned workouts", async () => {
    vi.mocked(getEndorphinsActivities).mockResolvedValue([
      createActivity("1"),
      createActivity("2"),
      createActivity("3"),
    ]);

    const workouts = await getWorkouts({ limit: 2 });

    expect(workouts).toHaveLength(2);
    expect(workouts.map((workout) => workout.id)).toEqual(["1", "2"]);
  });

  it("returns an empty array when there are no activities", async () => {
    vi.mocked(getEndorphinsActivities).mockResolvedValue([]);

    await expect(getWorkouts()).resolves.toEqual([]);
  });

  it("propagates errors from the API client", async () => {
    vi.mocked(getEndorphinsActivities).mockRejectedValue(
      new Error("Endorphins request failed"),
    );

    await expect(getWorkouts()).rejects.toThrow(
      "Endorphins request failed",
    );
  });
});

describe("getLastWorkout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the most recent eligible workout", async () => {
    vi.mocked(getEndorphinsActivities).mockResolvedValue([
      createActivity("newest"),
      createActivity("older"),
    ]);

    const workout = await getLastWorkout();

    expect(getEndorphinsActivities).toHaveBeenCalledWith(365);
    expect(workout?.id).toBe("newest");
  });

  it("skips private activities when finding the latest workout", async () => {
    vi.mocked(getEndorphinsActivities).mockResolvedValue([
      createActivity("newest-private", true),
      createActivity("older-public"),
    ]);

    const workout = await getLastWorkout();

    expect(workout?.id).toBe("older-public");
  });

  it("returns null when no eligible workouts exist", async () => {
    vi.mocked(getEndorphinsActivities).mockResolvedValue([]);

    await expect(getLastWorkout()).resolves.toBeNull();
  });
});

describe("getWorkoutStats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calculates cumulative workout statistics", async () => {
    vi.mocked(getEndorphinsActivities).mockResolvedValue([
      createActivity("run-1"),
      {
        ...createActivity("run-2"),
        distance: 5000,
        type: "Run",
        moving_time: 1800,
      },
      {
        ...createActivity("walk-1"),
        type: "Walk",
        distance: 3000,
        moving_time: 2400,
      },
      {
        ...createActivity("ride-1"),
        type: "Ride",
        distance: 20000,
        moving_time: 3600,
      },
    ]);

    const stats = await getWorkoutStats();

    expect(getEndorphinsActivities).toHaveBeenCalledWith(365);

    expect(stats).toMatchObject({
      totalWorkouts: 4,
      totalRunningDistanceMeters: 15000,
      totalMovingTimeSeconds: 10800,
      activityTypeCounts: [
        { type: "Run", count: 2 },
        { type: "Ride", count: 1 },
        { type: "Walk", count: 1 },
      ],
    });

    expect(Date.parse(stats.periodEnd) - Date.parse(stats.periodStart))
      .toBe(365 * 24 * 60 * 60 * 1000);
  });

  it("excludes private activities from cumulative statistics", async () => {
    vi.mocked(getEndorphinsActivities).mockResolvedValue([
      createActivity("run-1"),
      createActivity("run-2", true),
    ]);

    const stats = await getWorkoutStats();

    expect(stats.totalWorkouts).toBe(1);
    expect(stats.totalRunningDistanceMeters).toBe(10000);
  });

  it("returns zero totals when there are no workouts", async () => {
    vi.mocked(getEndorphinsActivities).mockResolvedValue([]);

    const stats = await getWorkoutStats();

    expect(stats.totalWorkouts).toBe(0);
    expect(stats.totalRunningDistanceMeters).toBe(0);
    expect(stats.totalMovingTimeSeconds).toBe(0);
    expect(stats.activityTypeCounts).toEqual([]);
  });

  it("propagates errors from the workout service", async () => {
    vi.mocked(getEndorphinsActivities).mockRejectedValue(
      new Error("Endorphins request failed"),
    );

    await expect(getWorkoutStats()).rejects.toThrow(
      "Endorphins request failed",
    );
  });
});