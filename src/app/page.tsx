import { Suspense } from "react";
import CurrentProject from "./github/CurrentProject";

export default async function Home() {

  return (
    <main>
      <h1>My Website</h1>
      <Suspense fallback={null}>
        <CurrentProject />
      </Suspense>
    </main>
  );
}
