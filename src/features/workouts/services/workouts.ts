import "server-only";

import { cacheLife } from "next/cache";

import { getEndorphinsActivities } from "@/lib/integrations/endorphins/client";
import { mapEndorphinsActivity } from "../mappers/endorphins";
import type { Workout, WorkoutStats, WorkoutType, WorkoutsDashboardData } from "../types";
import { formatLastWorkout } from "../formatters/last-workout";

interface GetWorkoutsOptions {
  days?: number;
  limit?: number;
}

async function getCachedWorkouts(days: number): Promise<Workout[]> {
  "use cache";

  cacheLife("endorphins");

  const activities = await getEndorphinsActivities(days);

  return activities
    .map(mapEndorphinsActivity)
    .filter((workout): workout is Workout => workout !== null);
}

export async function getWorkouts({
  days = 365,
  limit,
}: GetWorkoutsOptions = {}): Promise<Workout[]> {
  const workouts = await getCachedWorkouts(days);

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
  const workouts = await getWorkouts({ days: 365 });
  return calculateWorkoutStats(workouts);
}

export function calculateWorkoutStats(workouts: Workout[]): WorkoutStats {
  const periodEnd = new Date();
  const periodStart = new Date(
    periodEnd.getTime() - 365 * 24 * 60 * 60 * 1000,
  );

  const activityCounts = new Map<WorkoutType, number>();

  let totalRunningDistanceMeters = 0;
  let totalMovingTimeSeconds = 0;

  for (const workout of workouts) {
    totalMovingTimeSeconds += workout.movingTimeSeconds;

    if (workout.type === "Run") {
      totalRunningDistanceMeters += workout.distanceMeters;
    }

    activityCounts.set(
      workout.type,
      (activityCounts.get(workout.type) ?? 0) + 1,
    );
  }

  const activityTypeCounts = Array.from(
    activityCounts,
    ([type, count]) => ({ type, count }),
  ).sort((a, b) => {
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

export async function getWorkoutsDashboardData(): Promise<WorkoutsDashboardData> {
  const workouts = await getWorkouts({ days: 365 });

  return {
    latest: workouts[0] ? formatLastWorkout(workouts[0]) : null,
    stats: calculateWorkoutStats(workouts),
  };
}