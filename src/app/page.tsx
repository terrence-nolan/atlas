import { Suspense } from "react";
import Dashboard from "@/features/dashboard/dashboard";

export default async function Home() {

  return (
    <main className="flex flex-col justify-center">
      <h1>Terrence Nolan</h1>
      <Suspense fallback={null}>
        <Dashboard />
      </Suspense>
    </main>
  );
}
