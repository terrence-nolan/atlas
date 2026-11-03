import { connection } from "next/server";

import { getWorkoutsData } from "@/features/workouts/data";
import { formatWorkoutDate } from "@/features/workouts/formatters/last-workout";

export default async function WorkoutsWidget() {
  await connection();

  const { latest: formattedWorkout } = await getWorkoutsData();

  return (
    <section>
      <h2>Most Recent Workout</h2>

      {formattedWorkout ? (
        <div>
          <h3>{formattedWorkout.name}</h3>
          <p>{formattedWorkout.type}</p>
          <p>{formatWorkoutDate(formattedWorkout.startedAt)}</p>

          <div>
            {formattedWorkout.primaryMetrics.map((metric) => (
              <div key={metric.label}>
                <span>{metric.label} </span>
                <span>{metric.value}</span>
              </div>
            ))}
          </div>

          <div>
            <span>Average Heart Rate </span>
            <span>{formattedWorkout.averageHeartRate ?? "-"}</span>
          </div>
        </div>
      ) : (
        <p>No recent workouts available.</p>
      )}
    </section>
  );
}