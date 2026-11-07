import { describe, expect, it } from "vitest";

import { mockVolumeResponse } from "@/lib/integrations/google-books/mocks/fixtures/volume";

import { formatBook } from "./format-book";

describe("formatBook", () => {
  it("formats a Google Books volume", () => {
    expect(formatBook(mockVolumeResponse)).toEqual({
      googleBooksId: "test-volume-id",
      title: "Atomic Habits",
      authors: ["James Clear"],
      pageCount: 320,
      coverImageUrl:
        "https://books.google.com/books/content?id=test-volume-id",
    });
  });

  it("omits optional fields when metadata is missing", () => {
    expect(
      formatBook({
        id: "test-volume-id",
        volumeInfo: {},
      }),
    ).toEqual({
      googleBooksId: "test-volume-id",
    });
  });

  it("omits the cover image when image links are missing", () => {
    expect(
      formatBook({
        id: "test-volume-id",
        volumeInfo: {
          title: "Atomic Habits",
        },
      }),
    ).toEqual({
      googleBooksId: "test-volume-id",
      title: "Atomic Habits",
    });
  });
});
