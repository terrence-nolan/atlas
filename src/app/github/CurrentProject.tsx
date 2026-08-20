import { getCurrentProject } from "@/features/github/getCurrentProject";

export default async function CurrentProject() {
  const project = await getCurrentProject();

  return (
    <>
      <>Name: {project.name}</><br/>
      <>Description: {project.description}</><br/>
      <>Last Updated: {project.latestCommit?.date}</><br/>
      <>Open Issues: {project.openIssues}</><br/>
    </>
  );
}