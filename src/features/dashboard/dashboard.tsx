import GitHubWidget from "@/features/dashboard/widgets/github-widget"
import WorkoutsWidget from "./widgets/workouts-widget";
import Widget from "@/app/dashboard/widget";

export default async function Dashboard() {

  return (
    <>
      <Widget>
        <GitHubWidget />
      </Widget>
      <Widget>
        <WorkoutsWidget />
      </Widget>
    </>
  );
}