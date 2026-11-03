export interface EndorphinsActivitiesResponse {
  activities: EndorphinsActivity[];
}

export interface EndorphinsActivity {
  _id: string;
  activity_id: string;
  activitySource: string;

  name: string;
  description?: string;
  type: string;

  start_date: string;
  start_date_local: string;

  distance: number;
  distance_kilometers: number;
  distance_miles: number;

  moving_time: number;
  elapsed_time: number;

  average_heartrate?: number | null;
  average_pace_per_km?: string | null;
  average_pace_per_mile?: string | null;

  total_elevation_gain?: number | null;
  calories?: number | null;

  privacy: EndorphinsActivityPrivacy;

  trainingLoad?: EndorphinsTrainingLoad;
  bestEfforts?: EndorphinsBestEffort[];
  raceTimePrediction?: EndorphinsRaceTimePrediction;
}

export interface EndorphinsActivityPrivacy {
  isPrivate: boolean;
  hideGeoData: boolean;
  hideHeartRate: boolean;
  hideSplits: boolean;
  hideFlashScore: boolean;
  visibility: string;

  hideEndDistance: boolean | null;
  hideStartDistance: boolean | null;
  hideStartEndDistance: boolean | null;
}

export interface EndorphinsTrainingLoad {
  aerobic: number;
  highAerobic: number;
  anaerobic: number;

  aerobicSeconds: number;
  highAerobicSeconds: number;
  anaerobicSeconds: number;

  trainingLoadImpact: number;
  fitnessContribution: number;
  fatigueContribution: number;
}

export interface EndorphinsBestEffort {
  distance: string;
  time: string;
  pacePerMile: string;
  pacePerKm: string;
}

export interface EndorphinsRaceTimePrediction {
  predictedTimes: Record<string, string>;
}