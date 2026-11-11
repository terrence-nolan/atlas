import { Suspense } from "react";
import { MapPinSimpleIcon, BriefcaseIcon} from "@phosphor-icons/react/ssr";
import Dashboard from "@/features/dashboard/dashboard";

export default async function Home() {

  return (
    <Suspense fallback={null}>
      <main className="flex flex-col justify-center px-30">
        <div className="pb-4">
          <h1 className="text-3xl font-bold text-primary self-center pt-8">Terrence Nolan</h1>
          <h2 className="text-2xl font-semibold text-secondary pt-2">Software Engineer</h2>
          <div className="flex flex-row gap-6 text-tertiary pt-2">
            <div className="flex flex-row justify-between pb-2 items-center">
              <p className="text-sm flex flex-row items-center gap-2">
                <MapPinSimpleIcon size={14} />
                Framingham, MA
              </p>
            </div>
            <div className="flex flex-row justify-between pb-2 items-center">
              <p className="text-sm flex flex-row items-center gap-2">
                <BriefcaseIcon size={14} />
                Chewy
              </p>
            </div>
          </div>
        </div>
          <Dashboard />
      </main>
    </Suspense>
  );
}
