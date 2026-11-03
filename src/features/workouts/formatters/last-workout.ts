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

const TIME_ZONE = "America/New_York";

function getCalendarDate(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function formatWorkoutDate(date: string): string {
  const workoutDate = new Date(date);
  const today = new Date();

  const workoutDay = getCalendarDate(workoutDate);
  const todayDay = getCalendarDate(today);

  if (workoutDay === todayDay) {
    return "Today";
  }

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (workoutDay === getCalendarDate(yesterday)) {
    return "Yesterday";
  }

  return new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    month: "long",
    day: "2-digit",
    year: "numeric",
  }).format(workoutDate);
}

export function formatLastWorkout(workout: Workout): FormattedWorkout {
  const primaryMetrics: FormattedWorkout["primaryMetrics"] = [];

  const addMetric = (label: string, value: string | null) => {
    if (value !== null) {
      primaryMetrics.push({ label, value });
    }
  };

  const addDistance = (unit: "mi" | "yd") => {
    if (workout.distanceMeters > 0) {
      const value = formatDistance(workout.distanceMeters, unit);
      addMetric("Distance", value);
    }
  };

  const addMovingTime = () => {
    addMetric("Time", formatDuration(workout.movingTimeSeconds));
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
      addMetric(
        "Pace",
        workout.averagePacePerMile
          ? `${workout.averagePacePerMile}/mi`
          : null,
      );
      addMovingTime();
      break;

    case "walk":
      addDistance("mi");
      addMovingTime();
      addCalories();
      break;

    case "ride":
      addDistance("mi");
      addMovingTime();
      break;

    case "swim":
    case "row":
      addDistance("yd");
      addMovingTime();
      break;

    case "other":
      addDistance("mi");
      addMovingTime();
      addCalories();
      break;
  }

  return {
    id: workout.id,
    name: workout.name,
    type: workout.type,
    startedAt: workout.startedAt,
    primaryMetrics,
    averageHeartRate:
      workout.averageHeartRate === null
        ? null
        : `${Math.round(workout.averageHeartRate)} bpm`,
  };
}