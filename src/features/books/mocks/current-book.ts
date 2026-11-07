import type { CurrentBook } from "../types";

export const mockCurrentBook: CurrentBook = {
  googleBooksId: "mock-volume-id",
  title: "Example Book",
  authors: ["Example Author"],
  pageCount: 320,
  coverImageUrl: "https://example.com/book-cover.jpg",
  currentPage: 85,
  startedAt: "2026-11-01",
  progressUpdatedAt: "2026-11-06",
};
