import type { CurrentProject } from "../types";

export const mockCurrentProject: CurrentProject = {
  name: "atlas",
  description: "My personal website and developer portfolio.",
  url: "https://github.com/your-username/atlas",

  latestCommit: {
    date: "2026-11-01T18:42:00Z",
  },

  // Seven consecutive days, oldest to newest.
  commitsLast7Days: [2, 0, 3, 1, 4, 0, 2],

  openIssues: 5,

  languages: [
    { name: "TypeScript", percentage: 72 },
    { name: "CSS", percentage: 18 },
    { name: "JavaScript", percentage: 7 },
    { name: "HTML", percentage: 3 },
  ],
};
