import "server-only";

import { mockWorkoutsDashboard } from "./mocks/dashboard";
import { getWorkoutsDashboardData } from "./services/workouts";
import { selectDataSource } from "@/lib/data/selectDataSource";

export function getWorkoutsData() {
  return selectDataSource({
    mock: () => mockWorkoutsDashboard,
    live: getWorkoutsDashboardData,
  });
}