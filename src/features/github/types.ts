export type CurrentProject = {
  name: string;
  description: string | null;
  url: string;
  latestCommit: {
    date: string;
  } | null;
  commitsLast7Days: number[];
  openIssues: number;
  languages: {
    name: string;
    percentage: number;
  }[];
};