import type { GitHubCommit, GitHubIssueSearchResponse, GitHubLanguages, GitHubRepository } from "./types";

const GITHUB_API_URL = "https://api.github.com";

export async function getRepository(username: string, repoName: string): Promise<GitHubRepository> {
  const response = await fetch(
    `${GITHUB_API_URL}/repos/${username}/${repoName}`
  );

  if (!response.ok) {
    throw new Error(`getRepository error: ${response.status} — ${response.statusText}`);
  }

  return response.json() as Promise<GitHubRepository>;
}

export async function getLatestUserCommit(username: string, repoName: string): Promise<GitHubCommit[]> {
  const response = await fetch(
    `${GITHUB_API_URL}/repos/${username}/${repoName}/commits?author=${username}&per_page=1`
  );

  if (!response.ok) {
    throw new Error(
      `getLatestCommit error: ${response.status} — ${response.statusText}`
    );
  }

  return response.json() as Promise<GitHubCommit[]>;
}

export async function getRecentCommits(
  username: string,
  repoName: string,
  since: string,
  until: string,
): Promise<GitHubCommit[]> {
  const params = new URLSearchParams({
    author: username,
    since,
    until,
  });

  const response = await fetch(
    `${GITHUB_API_URL}/repos/${username}/${repoName}/commits?${params}`
  );

  if (!response.ok) {
    throw new Error(
      `getRecentCommits error: ${response.status} — ${response.statusText}`
    );
  }

  return response.json() as Promise<GitHubCommit[]>;
}

export async function getOpenIssues(username: string, repoName: string): Promise<GitHubIssueSearchResponse> {
  const response = await fetch(
    `${GITHUB_API_URL}/repos/${username}/${repoName}/issues`
  );

  if (!response.ok) {
    throw new Error(`getOpenIssuesCount error: ${response.status} — ${response.statusText}`);
  }

  return response.json() as Promise<GitHubIssueSearchResponse>;
}

export async function getLanguages(username: string, repoName: string): Promise<GitHubLanguages> {
  const response = await fetch(
    `${GITHUB_API_URL}/repos/${username}/${repoName}/languages`
  );

  if (!response.ok) {
    throw new Error(`getLanguages error: ${response.status} — ${response.statusText}`);
  }

  return response.json() as Promise<GitHubLanguages>;
}