import GitHubWidget from "@/features/dashboard/widgets/github-widget"
import WorkoutsWidget from "./widgets/workouts-widget";
import WidgetWrapper from "@/app/dashboard/widget-wrapper";

export default async function Dashboard() {

  return (
    <div className="flex flex-row justify-center gap-4">
      <WidgetWrapper themeColor="sage">
        <GitHubWidget />
      </WidgetWrapper>
      <WidgetWrapper themeColor="clay">
        <WorkoutsWidget />
      </WidgetWrapper>
    </div>
  );
}