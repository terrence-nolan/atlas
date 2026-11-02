export type GitHubRepository = {
  name: string;
  description: string | null;
  html_url: string;
};

export type GitHubCommit = {
  sha: string;
  commit: {
    author: {
      date: string | null;
    };
    message: string;
  };
  author: {
    login: string;
  } | null;
};

export type GitHubIssue = {
  id: number;
  number: number;
  title: string;
  state: "open" | "closed";
  html_url: string;
  pull_request?: {
    url: string;
  };
};

export type GitHubLanguages = Record<string, number>;