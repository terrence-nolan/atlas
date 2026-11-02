
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

import {
  getRepository,
  getLatestUserCommit,
  getRecentCommits,
  getOpenIssues,
  getLanguages,
} from "../client";

import { mockCommits } from "../mocks/fixtures/commits";
import { GitHubIssue } from "../types";

const API_URL = "https://api.github.com";
const USERNAME = "octocat";
const REPOSITORY = "atlas";
const REPOSITORY_URL = `${API_URL}/repos/${USERNAME}/${REPOSITORY}`;

const server = setupServer();

beforeAll(() => {
  server.listen({
    onUnhandledFrame: "error",
  });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

describe("GitHub integration client", () => {
  describe("getRepository", () => {
    it("fetches repository information", async () => {
      const mockRepository = {
        id: 123,
        name: REPOSITORY,
        full_name: `${USERNAME}/${REPOSITORY}`,
        description: "My personal website",
        html_url: "https://github.com/octocat/atlas",
        open_issues_count: 3,
      };

      server.use(
        http.get(REPOSITORY_URL, () => {
          return HttpResponse.json(mockRepository);
        }),
      );

      const result = await getRepository(USERNAME, REPOSITORY);

      expect(result).toEqual(mockRepository);
    });
  });

  describe("getLatestUserCommit", () => {
    it("fetches the latest commit by the specified author", async () => {
      server.use(
        http.get(`${REPOSITORY_URL}/commits`, ({ request }) => {
          const url = new URL(request.url);

          expect(url.searchParams.get("author")).toBe(USERNAME);
          expect(url.searchParams.get("per_page")).toBe("1");

          return HttpResponse.json([mockCommits[0]]);
        }),
      );

      const result = await getLatestUserCommit(USERNAME, REPOSITORY);

      expect(result).toEqual([mockCommits[0]]);
    });
  });

  describe("getRecentCommits", () => {
    it("fetches commits within the specified date range", async () => {
      const since = "2026-10-27T00:00:00Z";
      const until = "2026-11-02T23:59:59Z";

      server.use(
        http.get(`${REPOSITORY_URL}/commits`, ({ request }) => {
          const url = new URL(request.url);

          expect(url.searchParams.get("author")).toBe(USERNAME);
          expect(url.searchParams.get("since")).toBe(since);
          expect(url.searchParams.get("until")).toBe(until);

          return HttpResponse.json(mockCommits);
        }),
      );

      const result = await getRecentCommits(
        USERNAME,
        REPOSITORY,
        since,
        until,
      );

      expect(result).toEqual(mockCommits);
    });
  });

  describe("getOpenIssues", () => {
    it("fetches issues for the specified repository", async () => {
      const mockIssues: GitHubIssue[] = [
        {
          id: 1,
          number: 10,
          title: "Improve homepage layout",
          state: "open" as const,
          html_url: "https://github.com/octocat/atlas/issues/10",
        },
        {
          id: 2,
          number: 11,
          title: "Add Strava integration",
          state: "open" as const,
          html_url: "https://github.com/octocat/atlas/issues/11",
        },
        {
          id: 3,
          number: 12,
          title: "Add documentation",
          state: "open" as const,
          html_url: "https://github.com/octocat/atlas/pull/12",
          pull_request: {
            url: "https://api.github.com/repos/octocat/atlas/pulls/12",
          },
        },
      ];

      server.use(
        http.get(`${REPOSITORY_URL}/issues`, () => {
          return HttpResponse.json(mockIssues);
        }),
      );

      const result = await getOpenIssues(USERNAME, REPOSITORY);

      expect(result).toEqual(mockIssues);
    });
  });

  describe("getLanguages", () => {
    it("fetches repository language statistics", async () => {
      const mockLanguages = {
        TypeScript: 45000,
        CSS: 12000,
        JavaScript: 8000,
      };

      server.use(
        http.get(`${REPOSITORY_URL}/languages`, () => {
          return HttpResponse.json(mockLanguages);
        }),
      );

      const result = await getLanguages(USERNAME, REPOSITORY);

      expect(result).toEqual(mockLanguages);
    });
  });

  describe("HTTP errors", () => {
    const clientMethods = [
      {
        name: "getRepository",
        request: () => getRepository(USERNAME, REPOSITORY),
        endpoint: REPOSITORY_URL,
      },
      {
        name: "getLatestUserCommit",
        request: () => getLatestUserCommit(USERNAME, REPOSITORY),
        endpoint: `${REPOSITORY_URL}/commits`,
      },
      {
        name: "getRecentCommits",
        request: () =>
          getRecentCommits(
            USERNAME,
            REPOSITORY,
            "2026-10-27T00:00:00Z",
            "2026-11-02T23:59:59Z",
          ),
        endpoint: `${REPOSITORY_URL}/commits`,
      },
      {
        name: "getOpenIssues",
        request: () => getOpenIssues(USERNAME, REPOSITORY),
        endpoint: `${REPOSITORY_URL}/issues`,
      },
      {
        name: "getLanguages",
        request: () => getLanguages(USERNAME, REPOSITORY),
        endpoint: `${REPOSITORY_URL}/languages`,
      },
    ];

    it.each(clientMethods)(
      "$name throws when GitHub returns an unsuccessful response",
      async ({ request, endpoint }) => {
        server.use(
          http.get(endpoint, () => {
            return HttpResponse.json(
              { message: "Service Unavailable" },
              {
                status: 503,
                statusText: "Service Unavailable",
              },
            );
          }),
        );

        await expect(request()).rejects.toThrow(
          "503 — Service Unavailable",
        );
      },
    );
  });
});
