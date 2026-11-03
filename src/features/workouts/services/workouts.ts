import "server-only";

import { getEndorphinsActivities } from "@/lib/integrations/endorphins/client";
import { mapEndorphinsActivity } from "../mappers/endorphins";
import type { Workout, WorkoutStats, WorkoutType } from "../types";

interface GetWorkoutsOptions {
  days?: number;
  limit?: number;
}

export async function getWorkouts({
  days = 365,
  limit,
}: GetWorkoutsOptions = {}): Promise<Workout[]> {
  const activities = await getEndorphinsActivities(days);

  const workouts = activities
    .map(mapEndorphinsActivity)
    .filter((workout): workout is Workout => workout !== null);

  return typeof limit === "number"
    ? workouts.slice(0, limit)
    : workouts;
}

export async function getLastWorkout(): Promise<Workout | null> {
  const [lastWorkout] = await getWorkouts({
    days: 365,
    limit: 1,
  });

  return lastWorkout ?? null;
}

export async function getWorkoutStats(): Promise<WorkoutStats> {
  const periodEnd = new Date();
  const periodStart = new Date(
    periodEnd.getTime() - 365 * 24 * 60 * 60 * 1000,
  );

  const workouts = await getWorkouts({ days: 365 });

  const activityCounts = new Map<WorkoutType, number>();

  let totalRunningDistanceMeters = 0;
  let totalMovingTimeSeconds = 0;

  for (const workout of workouts) {
    // Accumulate total activity time.
    totalMovingTimeSeconds += workout.movingTimeSeconds;

    // Only running activities contribute to running distance.
    if (workout.type === "run") {
      totalRunningDistanceMeters += workout.distanceMeters;
    }

    // Count activities by normalized workout type.
    activityCounts.set(
      workout.type,
      (activityCounts.get(workout.type) ?? 0) + 1,
    );
  }

  const activityTypeCounts = Array.from(
    activityCounts,
    ([type, count]) => ({ type, count }),
  ).sort((a, b) => {
    // Sort by frequency, then alphabetically for consistent ordering.
    return b.count - a.count || a.type.localeCompare(b.type);
  });

  return {
    periodStart: periodStart.toISOString(),
    periodEnd: periodEnd.toISOString(),
    totalWorkouts: workouts.length,
    totalRunningDistanceMeters,
    totalMovingTimeSeconds,
    activityTypeCounts,
  };
}