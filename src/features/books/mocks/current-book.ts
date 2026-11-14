import type { CurrentBook } from "../types";

export const mockCurrentBook: CurrentBook = {
  googleBooksId: "mock-volume-id",
  title: "Example Book",
  authors: ["Example Author"],
  pageCount: 320,
  coverImageUrl: "/images/book-cover-placeholder.jpeg",
  currentPage: 85,
  startedAt: "2026-11-01",
  progressUpdatedAt: "2026-11-06",
};
