import type { GoogleBooksVolume } from "@/lib/integrations/google-books/types";

import type { BookMetadata } from "./types";

export function formatBook(volume: GoogleBooksVolume): BookMetadata {
  const imageLinks = volume.volumeInfo.imageLinks;

  return {
    googleBooksId: volume.id,
    ...(volume.volumeInfo.title && {
      title: volume.volumeInfo.title,
    }),
    ...(volume.volumeInfo.authors && {
      authors: volume.volumeInfo.authors,
    }),
    ...(volume.volumeInfo.pageCount !== undefined && {
      pageCount: volume.volumeInfo.pageCount,
    }),
    ...(imageLinks?.thumbnail && {
      coverImageUrl: imageLinks.thumbnail.replace("http://", "https://"),
    }),
  };
}
