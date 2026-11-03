import GitHubWidget from "@/features/dashboard/widgets/github-widget"
import WorkoutsWidget from "./widgets/workouts-widget";

export default async function Dashboard() {

  return (
    <>
      <GitHubWidget />
      <WorkoutsWidget />
    </>
  );
}