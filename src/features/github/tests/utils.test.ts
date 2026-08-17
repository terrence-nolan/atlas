import { describe, expect, it } from "vitest";
import {
  getDateKey,
  getCommitCountsLast7Days,
  mapLanguageData,
  mapLatestCommit,
} from "../utils";
import type { GitHubCommit, GitHubLanguages } from "@/lib/integrations/github/types";

describe("getDateKey", () => {
  it("returns a date in YYYY-MM-DD format", () => {
    const date = new Date("2026-08-17T15:30:00Z");

    expect(getDateKey(date)).toBe("2026-08-17");
  });
});

describe("mapLatestCommit", () => {
  it("returns null when there is no latest commit", () => {
    expect(mapLatestCommit(null)).toBeNull();
  });

  it("maps a commit to a latest commit object", () => {
    const commit = {
      commit: {
        author: {
          date: "2026-08-17T15:30:00Z",
        },
      },
    } as GitHubCommit;

    expect(mapLatestCommit(commit)).toEqual({
      date: "2026-08-17T15:30:00Z",
    });
  });

  it("uses an empty string when the commit date is null", () => {
    const commit = {
      commit: {
        author: {
          date: null,
        },
      },
    } as GitHubCommit;

    expect(mapLatestCommit(commit)).toEqual({
      date: "",
    });
  });
});

describe("getCommitCountsLast7Days", () => {
  const now = new Date("2026-08-17T12:00:00Z");

  it("returns seven zero counts when there are no commits", () => {
    expect(getCommitCountsLast7Days([], now)).toEqual([
      0, 0, 0, 0, 0, 0, 0,
    ]);
  });

  it("counts commits for each of the last seven days", () => {
    const commits = [
      {
        commit: {
          author: {
            date: "2026-08-11T10:00:00Z",
          },
        },
      },
      {
        commit: {
          author: {
            date: "2026-08-11T14:00:00Z",
          },
        },
      },
      {
        commit: {
          author: {
            date: "2026-08-13T09:00:00Z",
          },
        },
      },
      {
        commit: {
          author: {
            date: "2026-08-17T16:00:00Z",
          },
        },
      },
    ] as GitHubCommit[];

    expect(getCommitCountsLast7Days(commits, now)).toEqual([
      0, 2, 0, 1, 0, 0, 1,
    ]);
  });

  it("ignores commits outside the last seven days", () => {
    const commits = [
      {
        commit: {
          author: {
            date: "2026-08-10T10:00:00Z",
          },
        },
      },
      {
        commit: {
          author: {
            date: "2026-08-18T10:00:00Z",
          },
        },
      },
    ] as GitHubCommit[];

    expect(getCommitCountsLast7Days(commits, now)).toEqual([
      0, 0, 0, 0, 0, 0, 0,
    ]);
  });

  it("ignores commits without a date", () => {
    const commits = [
      {
        commit: {
          author: {
            date: null,
          },
        },
      },
    ] as GitHubCommit[];

    expect(getCommitCountsLast7Days(commits, now)).toEqual([
      0, 0, 0, 0, 0, 0, 0,
    ]);
  });
});

describe("mapLanguageData", () => {
  it("returns an empty array when there are no languages", () => {
    expect(mapLanguageData({})).toEqual([]);
  });

  it("maps language byte counts to percentages", () => {
    const languageData: GitHubLanguages = {
      TypeScript: 970,
      JavaScript: 30,
    };

    expect(mapLanguageData(languageData)).toEqual([
      {
        name: "TypeScript",
        percentage: 97,
      },
      {
        name: "JavaScript",
        percentage: 3,
      },
    ]);
  });

  it("rounds language percentages to whole numbers", () => {
    const languageData: GitHubLanguages = {
      TypeScript: 2,
      JavaScript: 1,
    };

    expect(mapLanguageData(languageData)).toEqual([
      {
        name: "TypeScript",
        percentage: 67,
      },
      {
        name: "JavaScript",
        percentage: 33,
      },
    ]);
  });

  it("returns an empty array when all language byte counts are zero", () => {
    const languageData: GitHubLanguages = {
      TypeScript: 0,
      JavaScript: 0,
    };

    expect(mapLanguageData(languageData)).toEqual([]);
  });
});