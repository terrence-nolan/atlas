import { connection } from "next/server";
import { HeartStraightIcon, PulseIcon } from "@phosphor-icons/react/ssr";

import { getWorkoutsData } from "@/features/workouts/data";
import { getDateKey, formatCalendarDate } from "@/lib/utils/date";

export default async function WorkoutsWidget() {
  await connection();

  const { latest: formattedWorkout } = await getWorkoutsData();
  
  return (
    <section>
      {formattedWorkout ? (
        <div>
          <div>
            <h4 className="font-bold text-lg flex flex-row items-center gap-2 pb-2">
              <PulseIcon size={18} weight="bold" />
              Latest Workout
            </h4>
          </div>
          <h5 className="font-semibold">{formattedWorkout.name}</h5>
          <div className="flex flex-row gap-1 items-center font-light text-xs pb-4">
            <p>{formatCalendarDate(getDateKey(formattedWorkout.startedAt))}</p>
            <p>•</p>
            <p>{formattedWorkout.type}</p>
          </div>

          <div className="flex flex-row gap-8 justify-between pb-4">
            {formattedWorkout.primaryMetrics.map((metric) => (
              <div key={metric.label} className="flex flex-col">
                <span className="text-sm">{metric.label} </span>
                <span className="font-semibold">{metric.value}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-row gap-1 items-center">
            <HeartStraightIcon size={16} weight="fill" />
            <span className="text-sm">{formattedWorkout.averageHeartRate ?? "-"}</span>
          </div>
        </div>
      ) : (
        <p>No recent workouts available.</p>
      )}
    </section>
  );
}