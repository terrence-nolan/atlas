import { Suspense } from "react";
import Dashboard from "@/features/dashboard/dashboard";

export default async function Home() {

  return (
    <main className="flex flex-col justify-center px-12">
      <h1 className="text-4xl font-bold text-blue-text self-center py-8">Terrence Nolan</h1>
      <Suspense fallback={null}>
        <Dashboard />
      </Suspense>
    </main>
  );
}
