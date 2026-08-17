import { getCurrentProject } from "@/features/github/getCurrentProject";

export default async function Home() {
  const project = await getCurrentProject();
  console.log(project);
  return (
    <main>
      <h1>My Website</h1>
    </main>
  );
}
