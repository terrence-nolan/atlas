import type { FormattedWorkout, Workout } from "../types";

const METERS_PER_MILE = 1609.344;
const METERS_PER_YARD = 0.9144;

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }

  return `${remainingSeconds}s`;
}

function formatDistance(meters: number, unit: "mi" | "yd"): string {
  const distance =
    unit === "mi"
      ? meters / METERS_PER_MILE
      : meters / METERS_PER_YARD;

  return `${distance.toFixed(2)} ${unit}`;
}

function formatHeartRate(heartRate: number | null): string | null {
  return heartRate === null ? null : `${Math.round(heartRate)} bpm`;
}

export function formatLastWorkout(
  workout: Workout,
): FormattedWorkout {
  const metrics: FormattedWorkout["metrics"] = [];

  const addMetric = (label: string, value: string | null) => {
    if (value !== null) {
      metrics.push({ label, value });
    }
  };

  const addDistance = (unit: "mi" | "yd") => {
    addMetric("Distance", formatDistance(workout.distanceMeters, unit));
  };

  const addMovingTime = () => {
    addMetric("Time", formatDuration(workout.movingTimeSeconds));
  };

  const addHeartRate = () => {
    addMetric("Avg HR", formatHeartRate(workout.averageHeartRate));
  };

  const addCalories = () => {
    addMetric(
      "Calories",
      workout.calories === null ? null : `${workout.calories} kcal`,
    );
  };

  switch (workout.type) {
    case "run":
      addDistance("mi");
      addMovingTime();
      addMetric("Pace", workout.averagePacePerMile);
      addHeartRate();
      break;

    case "walk":
      addDistance("mi");
      addMovingTime();
      addCalories();
      break;

    case "ride":
      addDistance("mi");
      addMovingTime();
      addHeartRate();
      break;

    case "swim":
    case "row":
      addDistance("yd");
      addMovingTime();
      addHeartRate();
      break;

    case "other":
      addMovingTime();
      addCalories();
      addHeartRate();
      break;
  }

  return {
    id: workout.id,
    name: workout.name,
    type: workout.type,
    startedAt: workout.startedAt,
    metrics,
  };
}