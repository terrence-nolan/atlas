import { connection } from "next/server";
import { getCurrentProject } from "@/features/github/getCurrentProject";

export default async function CurrentProject() {
  await connection();

  const project = await getCurrentProject();

  console.log(project);

  return (
    <>
      <>{project.name}</>
      <>{project.description}</>
      <>{project.latestCommit?.date}</>
    </>
  );
}