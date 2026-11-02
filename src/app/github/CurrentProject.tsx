import { getCurrentProjectData } from "@/features/github/data";

export default async function CurrentProject() {
  const project = await getCurrentProjectData();

  return (
    <>
      <h2>Currently Building</h2>
      <div>
        <>Name: {project.name}</><br/>
        <>Description: {project.description}</><br/>
        <>Last Updated: {project.latestCommit?.date}</><br/>
        <>Open Issues: {project.openIssues}</><br/>
      </div>
    </>
  );
}