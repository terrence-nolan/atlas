export type WorkoutType =
  | "run"
  | "walk"
  | "ride"
  | "swim"
  | "row"
  | "other";

export interface Workout {
  id: string;

  name: string;
  type: WorkoutType;

  startedAt: string;

  distanceMeters: number;
  movingTimeSeconds: number;
  elapsedTimeSeconds: number;

  averageHeartRate: number | null;
  averagePacePerKilometer: string | null;
  averagePacePerMile: string | null;

  calories: number | null;

  source: string;
}

export interface WorkoutStats {
  periodStart: string;
  periodEnd: string;
  totalWorkouts: number;
  totalRunningDistanceMeters: number;
  totalMovingTimeSeconds: number;
  activityTypeCounts: {
    type: WorkoutType;
    count: number;
  }[];
}

export interface FormattedWorkout {
  id: string;
  name: string;
  type: string;
  startedAt: string;
  metrics: {
    label: string;
    value: string;
  }[];
}