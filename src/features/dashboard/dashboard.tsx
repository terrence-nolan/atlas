import GitHubWidget from "@/features/dashboard/widgets/github-widget"
import WorkoutsWidget from "./widgets/workouts-widget";
import WidgetWrapper from "@/app/dashboard/widget-wrapper";

export default async function Dashboard() {

  return (
    <div className="flex flex-row justify-center gap-4">
      <WidgetWrapper header="Currently Building" themeColor="sage">
        <GitHubWidget />
      </WidgetWrapper>
      <WidgetWrapper header="Latest Workout" themeColor="clay">
        <WorkoutsWidget />
      </WidgetWrapper>
    </div>
  );
}