import { getCurrentProjectData } from "@/features/github/data";

export default async function GitHubWidget() {
  const project = await getCurrentProjectData();

  return (
    <div className="flex flex-col">
      <h4 className="font-bold text-lg">{project.name}</h4>
      <p>{project.description}</p>
      <p className="text-xs">{project.languages[0].name}</p>
      <p className="font-extralight text-xs pt-4">Updated {project.latestCommit?.date}</p>
    </div>
  );
}