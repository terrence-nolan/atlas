import type { EndorphinsActivity } from "@/lib/integrations/endorphins/types";

import type { Workout, WorkoutType } from "../types";

function mapWorkoutType(type: string): WorkoutType {
  switch (type.toLowerCase()) {
    case "run":
      return "run";
    case "walk":
      return "walk";
    case "ride":
    case "cycling":
    case "virtualride":
      return "ride";
    case "swim":
      return "swim";
    case "row":
    case "rowing":
      return "row";
    default:
      return "other";
  }
}

export function mapEndorphinsActivity(
  activity: EndorphinsActivity,
): Workout | null {
  if (activity.privacy.isPrivate) {
    return null;
  }

  return {
    id: activity._id,
    name: activity.name,
    type: mapWorkoutType(activity.type),
    startedAt: activity.start_date,
    distanceMeters: activity.distance,
    movingTimeSeconds: activity.moving_time,
    elapsedTimeSeconds: activity.elapsed_time,
    averageHeartRate: activity.privacy.hideHeartRate
      ? null
      : activity.average_heartrate ?? null,
    averagePacePerKilometer: activity.average_pace_per_km ?? null,
    averagePacePerMile: activity.average_pace_per_mile ?? null,
    calories: activity.calories ?? null,
    source: activity.activitySource,
  };
}