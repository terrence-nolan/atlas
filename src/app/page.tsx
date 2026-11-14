import { Suspense } from "react";
import { MapPinSimpleIcon, BriefcaseIcon} from "@phosphor-icons/react/ssr";
import Dashboard from "@/features/dashboard/dashboard";

export default async function Home() {

  return (
    <Suspense fallback={null}>
      <main className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="pb-4">
          <h1 className="text-2xl font-bold text-primary sm:text-3xl">
            Terrence Nolan
          </h1>
          <h2 className="pt-2 text-lg font-semibold text-secondary sm:text-2xl">
            Software Engineer
          </h2>
          <div className="flex flex-row gap-6 text-tertiary pt-2">
            <div className="flex flex-row justify-between pb-2 items-center">
              <p className="text-sm flex flex-row items-center gap-2">
                <MapPinSimpleIcon size={14} />
                Massachusetts, USA
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
