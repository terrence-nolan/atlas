import { describe, expect, it } from "vitest";

import { formatLastWorkout } from "./last-workout";
import type { Workout } from "../types";

const createWorkout = (
  overrides: Partial<Workout> = {},
): Workout => ({
  id: "workout-123",
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
  ...overrides,
});

describe("formatLastWorkout", () => {
  it("formats a running workout", () => {
    const result = formatLastWorkout(createWorkout());

    expect(result.primaryMetrics).toEqual([
      { label: "Distance", value: "6.21 mi" },
      { label: "Pace", value: "8:03/mi" },
      { label: "Time", value: "50m 0s" },
    ]);
  });

  it("formats a walk", () => {
    const result = formatLastWorkout(
      createWorkout({ type: "walk" }),
    );

    expect(result.primaryMetrics).toEqual([
      { label: "Distance", value: "6.21 mi" },
      { label: "Time", value: "50m 0s" },
      { label: "Calories", value: "650 kcal" },
    ]);
  });

  it("formats a bike ride", () => {
    const result = formatLastWorkout(
      createWorkout({ type: "ride" }),
    );

    expect(result.primaryMetrics).toEqual([
      { label: "Distance", value: "6.21 mi" },
      { label: "Time", value: "50m 0s" },
    ]);
  });

  it("formats a swim using yards", () => {
    const result = formatLastWorkout(
      createWorkout({ type: "swim" }),
    );

    expect(result.primaryMetrics[0]).toEqual({
      label: "Distance",
      value: "10936.13 yd",
    });
  });

  it("formats a row using yards", () => {
    const result = formatLastWorkout(
      createWorkout({ type: "row" }),
    );

    expect(result.primaryMetrics[0]).toEqual({
      label: "Distance",
      value: "10936.13 yd",
    });
  });

  it("formats other workouts", () => {
    const result = formatLastWorkout(
      createWorkout({ type: "other" }),
    );

    expect(result.primaryMetrics).toEqual([
      { label: "Distance", value: "6.21 mi"},
      { label: "Time", value: "50m 0s" },
      { label: "Calories", value: "650 kcal" },
    ]);
  });

  it("omits unavailable metrics", () => {
    const result = formatLastWorkout(
      createWorkout({
        averageHeartRate: null,
        averagePacePerMile: null,
        calories: null,
      }),
    );

    expect(result.primaryMetrics).toEqual([
      { label: "Distance", value: "6.21 mi" },
      { label: "Time", value: "50m 0s" },
    ]);
  });

  it("preserves the workout date and time", () => {
    const workout = createWorkout();
    const result = formatLastWorkout(workout);

    expect(result.startedAt).toBe(workout.startedAt);
  });
});