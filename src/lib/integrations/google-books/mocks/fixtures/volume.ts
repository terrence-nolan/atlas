import type { GoogleBooksVolume } from "../../types";

export const mockVolumeResponse: GoogleBooksVolume = {
  id: "test-volume-id",
  volumeInfo: {
    title: "Atomic Habits",
    authors: ["James Clear"],
    pageCount: 320,
    imageLinks: {
      thumbnail:
        "http://books.google.com/books/content?id=test-volume-id",
      smallThumbnail:
        "http://books.google.com/books/content?id=test-volume-id&zoom=5",
    },
  },
};
