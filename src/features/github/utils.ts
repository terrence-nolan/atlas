import { CurrentProject } from './types';
import type { GitHubCommit, GitHubLanguages } from "@/lib/integrations/github/types";

export function getDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function mapLatestCommit(commit: GitHubCommit | null): CurrentProject["latestCommit"] {
  if (!commit) {
    return null;
  }

  return {
    date: commit.commit.author.date ?? "",
  };
}

export function getCommitCountsLast7Days(commits: GitHubCommit[], now = new Date()): number[] {
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 6);

  const dates = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(sevenDaysAgo);
    date.setDate(sevenDaysAgo.getDate() + index);

    return getDateKey(date);
  });

  const commitCounts = Array(7).fill(0);

  commits.forEach((commit) => {
    const commitDate = commit.commit.author.date;

    if (!commitDate) {
      return;
    }

    const dateKey = getDateKey(new Date(commitDate));
    const index = dates.indexOf(dateKey);

    if (index !== -1) {
      commitCounts[index]++;
    }
  });

  return commitCounts;
}

export function mapLanguageData(languageData: GitHubLanguages): {name: string, percentage: number}[] {
  const totalBytes = Object.values(languageData).reduce(
    (total, bytes) => total + bytes,
    0,
  );

  if (totalBytes === 0) {
    return [];
  }

  return Object.entries(languageData).map(([name, bytes]) => ({
    name,
    percentage: Math.round((bytes / totalBytes) * 100),
  }));
}