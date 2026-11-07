import GitHubWidget from "@/features/dashboard/widgets/github-widget"
import WorkoutsWidget from "./widgets/workouts-widget";
import WidgetWrapper from "@/app/dashboard/widget-wrapper";
import ReadingWidget from "./widgets/reading-widget";

export default async function Dashboard() {

  return (
    <div className="flex flex-col justify-center gap-2 p-7 border border-blue-soft rounded-xl">
      <div className="flex flex-row gap-2">
        <WidgetWrapper themeColor="sage">
          <GitHubWidget />
        </WidgetWrapper>
        <WidgetWrapper themeColor="clay">
          <WorkoutsWidget />
        </WidgetWrapper>
      </div>
      <div className="flex flex-row gap-2">
        <WidgetWrapper themeColor="lavender">
          <ReadingWidget />
        </WidgetWrapper>
      </div>
    </div>
  );
}
