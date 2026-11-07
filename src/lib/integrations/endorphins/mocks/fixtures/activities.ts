import type { EndorphinsActivitiesResponse } from "../../types";

export const mockActivitiesResponse: EndorphinsActivitiesResponse = {
  activities: [
    {
      _id: "mock-activity-1",
      activity_id: "mock-activity-1",
      activitySource: "garmin",
      name: "Morning Run",
      type: "Run",
      start_date: "2026-11-06T12:00:00Z",
      start_date_local: "2026-11-06T07:00:00",
      distance: 5000,
      distance_kilometers: 5,
      distance_miles: 3.11,
      moving_time: 1800,
      elapsed_time: 1850,
      privacy: {
        isPrivate: false,
        hideGeoData: false,
        hideHeartRate: false,
        hideSplits: false,
        hideFlashScore: false,
        visibility: "public",
        hideEndDistance: null,
        hideStartDistance: null,
        hideStartEndDistance: null,
      },
    },
  ],
};
