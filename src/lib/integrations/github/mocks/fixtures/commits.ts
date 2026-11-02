
import type { GitHubCommit } from "../../types";

export const mockCommits: GitHubCommit[] = [
  {
    sha: "a1b2c3d4e5f6789012345678901234567890abcd",
    commit: {
      author: {
        date: "2026-11-02T14:30:00Z",
      },
      message: "feat: add GitHub integration tests",
    },
    author: {
      login: "octocat",
    },
  },
  {
    sha: "b2c3d4e5f6789012345678901234567890abcdef1",
    commit: {
      author: {
        date: "2026-11-01T10:15:00Z",
      },
      message: "refactor: improve data fetching",
    },
    author: {
      login: "octocat",
    },
  },
  {
    sha: "c3d4e5f6789012345678901234567890abcdef12",
    commit: {
      author: {
        date: "2026-10-30T16:45:00Z",
      },
      message: "chore: update dependencies",
    },
    author: {
      login: "octocat",
    },
  },
  {
    sha: "d4e5f6789012345678901234567890abcdef1234",
    commit: {
      author: {
        date: null,
      },
      message: "docs: update project documentation",
    },
    author: null,
  },
];
