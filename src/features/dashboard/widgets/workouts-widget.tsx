import { getLastWorkout } from "@/features/workouts/services/workouts";
import { formatLastWorkout, formatWorkoutDate } from "@/features/workouts/formatters/last-workout";

export default async function WorkoutsWidget() {
  const workout = await getLastWorkout();

  const formattedWorkout = workout
    ? formatLastWorkout(workout)
    : null;

  return (
    <section>
      <h2>Most Recent Workout</h2>

      {formattedWorkout ? (
        <div>
          <h3>{formattedWorkout.name}</h3>

          <p>
            {formattedWorkout.type}
          </p>

          <p>
            {formatWorkoutDate(formattedWorkout.startedAt)}
          </p>

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