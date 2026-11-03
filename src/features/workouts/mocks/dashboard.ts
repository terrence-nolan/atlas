import type { WorkoutsDashboardData } from "../types";

export const mockWorkoutsDashboard: WorkoutsDashboardData = {
  latest: {
    id: "mock-workout-1",
    name: "Morning Run",
    type: "run",
    startedAt: "2026-11-02T12:00:00.000Z",
    primaryMetrics: [
      { label: "Distance", value: "3.10 mi" },
      { label: "Time", value: "28m 42s" },
      { label: "Pace", value: "9:15 /mi" },
    ],
    averageHeartRate: "142 bpm",
  },
  stats: {
    periodStart: "2025-11-03T00:00:00.000Z",
    periodEnd: "2026-11-03T00:00:00.000Z",
    totalWorkouts: 142,
    totalRunningDistanceMeters: 650000,
    totalMovingTimeSeconds: 420000,
    activityTypeCounts: [
      { type: "run", count: 105 },
      { type: "walk", count: 25 },
      { type: "ride", count: 12 },
    ],
  },
};