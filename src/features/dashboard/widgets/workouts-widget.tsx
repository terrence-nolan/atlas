import { connection } from "next/server";
import { HeartStraightIcon, PulseIcon } from "@phosphor-icons/react/ssr";

import { getWorkoutsData } from "@/features/workouts/data";
import { getDateKey, formatCalendarDate, isToday } from "@/lib/utils/date";
import RecentActivityIndicator from "../recent-activity-indicator";

export default async function WorkoutsWidget() {
  await connection();

  const { latest: formattedWorkout } = await getWorkoutsData();

  return (
    <section className="flex flex-col grow">
      {formattedWorkout ? (
        <div>
          <div className="flex flex-row justify-between pb-1 md:pb-2 items-center">
            <h4 className="font-bold text-lg flex flex-row items-center gap-2">
              <PulseIcon size={18} weight="bold" className="text-clay-text" />
              Latest Workout
            </h4>
            {isToday(formattedWorkout.startedAt) && <RecentActivityIndicator themeColor="clay" />}
          </div>
          <h5 className="font-semibold">{formattedWorkout.type}</h5>
          <p className="font-light text-xs text-text-secondary pb-2 md:pb-4">{formatCalendarDate(getDateKey(formattedWorkout.startedAt))}</p>
          <div className="flex flex-row gap-10 pb-2 md:pb-4">
            {formattedWorkout.primaryMetrics.map((metric) => (
              <div key={metric.label} className="flex flex-col">
                <span className="text-sm text-text-secondary">{metric.label} </span>
                <span className="font-semibold">{metric.value}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-row gap-1 items-center">
            <HeartStraightIcon size={16} />
            <span className="text-sm">{formattedWorkout.averageHeartRate ?? "-"}</span>
          </div>
        </div>
      ) : (
        <p>No recent workouts available.</p>
      )}
    </section>
  );
}
