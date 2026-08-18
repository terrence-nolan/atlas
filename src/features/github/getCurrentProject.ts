import { cacheLife } from "next/cache";
import {
  getRepository,
  getLatestUserCommit,
  getRecentCommits,
  getOpenIssues,
  getLanguages,
} from "@/lib/integrations/github/client";
import type { CurrentProject } from "./types";
import { getCommitCountsLast7Days, mapLanguageData, mapLatestCommit } from "./utils";

async function fetchCurrentProject(
  username: string,
  repoName: string,
): Promise<CurrentProject> {
  "use cache";

  cacheLife("github");
  console.log("Fetching current project");

  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 6);
  const since = sevenDaysAgo.toISOString();
  const until = now.toISOString();

  const [
    repository,
    latestCommitResponse,
    recentCommits,
    openIssues,
    languageData,
  ] = await Promise.all([
    getRepository(username, repoName),
    getLatestUserCommit(username, repoName),
    getRecentCommits(username, repoName, since, until),
    getOpenIssues(username, repoName),
    getLanguages(username, repoName),
  ]);

  const latestCommit = mapLatestCommit(latestCommitResponse[0] ?? null);
  
  const commitsLast7Days = getCommitCountsLast7Days(recentCommits);

  const languages = mapLanguageData(languageData);

  return {
    name: repository.name,
    description: repository.description,
    url: repository.html_url,
    latestCommit,
    commitsLast7Days,
    openIssues: openIssues.total_count,
    languages,
  } as CurrentProject;
}

export async function getCurrentProject(): Promise<CurrentProject> {
  const username = process.env.ATLAS_GITHUB_USERNAME;
  const repoName = process.env.ATLAS_GITHUB_CURRENT_REPOSITORY;

  if (!username) {
    throw new Error("ATLAS_GITHUB_USERNAME is not configured");
  }

  if (!repoName) {
    throw new Error("ATLAS_GITHUB_CURRENT_REPOSITORY is not configured");
  }

  return fetchCurrentProject(username, repoName);
}