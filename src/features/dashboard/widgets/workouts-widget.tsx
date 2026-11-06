import { connection } from "next/server";
import { HeartStraightIcon } from "@phosphor-icons/react/ssr";

import { getWorkoutsData } from "@/features/workouts/data";
import { formatWorkoutDate } from "@/features/workouts/formatters/last-workout";

export default async function WorkoutsWidget() {
  await connection();

  const { latest: formattedWorkout } = await getWorkoutsData();

  return (
    <section>
      {formattedWorkout ? (
        <div>
          <h4 className="font-bold text-lg">{formattedWorkout.name}</h4>
          <div className="flex flex-row gap-1 items-center font-extralight text-xs">
            <p>{formatWorkoutDate(formattedWorkout.startedAt)}</p>
            <p>•</p>
            <p>{formattedWorkout.type}</p>
          </div>

          <div className="flex flex-row gap-8 justify-between py-4">
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