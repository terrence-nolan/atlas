export type GitHubRepository = {
  name: string;
  description: string | null;
  html_url: string;
}

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

export type GitHubIssueSearchResponse = {
  total_count: number;
  incomplete_results: boolean;
};

export type GitHubLanguages = Record<string, number>;