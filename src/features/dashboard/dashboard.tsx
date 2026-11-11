import GitHubWidget from "@/features/dashboard/widgets/github-widget"
import WorkoutsWidget from "./widgets/workouts-widget";
import WidgetWrapper from "@/app/dashboard/widget-wrapper";
import ReadingWidget from "./widgets/reading-widget";

export default async function Dashboard() {

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <WidgetWrapper themeColor="sage">
          <GitHubWidget />
        </WidgetWrapper>
        <WidgetWrapper themeColor="clay">
          <WorkoutsWidget />
        </WidgetWrapper>
      <div className="md:col-span-2">
        <WidgetWrapper themeColor="lavender">
          <ReadingWidget />
        </WidgetWrapper>
      </div>
    </section>
  );
}
