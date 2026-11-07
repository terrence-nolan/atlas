import "server-only";

import type { GoogleBooksVolume } from "./types";

const API_BASE_URL = "https://www.googleapis.com/books/v1/volumes";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(
    (item) => typeof item === "string",
  );
}

function parseGoogleBooksVolume(value: unknown): GoogleBooksVolume {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    !isRecord(value.volumeInfo)
  ) {
    throw new Error("Google Books returned an invalid volume response");
  }

  const info = value.volumeInfo;

  const imageLinks = isRecord(info.imageLinks)
    ? {
        ...(typeof info.imageLinks.thumbnail === "string" && {
          thumbnail: info.imageLinks.thumbnail,
        }),
        ...(typeof info.imageLinks.smallThumbnail === "string" && {
          smallThumbnail: info.imageLinks.smallThumbnail,
        }),
      }
    : undefined;

  return {
    id: value.id,
    volumeInfo: {
      ...(typeof info.title === "string" && {
        title: info.title,
      }),
      ...(isStringArray(info.authors) && {
        authors: info.authors,
      }),
      ...(typeof info.pageCount === "number" &&
        Number.isInteger(info.pageCount) &&
        info.pageCount >= 0 && {
          pageCount: info.pageCount,
        }),
      ...(imageLinks && Object.keys(imageLinks).length > 0 && {
        imageLinks,
      }),
    },
  };
}

export async function getGoogleBooksVolume(
  volumeId: string,
): Promise<GoogleBooksVolume> {
  if (!volumeId.trim()) {
    throw new Error("Google Books volume ID cannot be empty");
  }

  const response = await fetch(
    `${API_BASE_URL}/${encodeURIComponent(volumeId)}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `Google Books volume request failed with status ${response.status}`,
    );
  }

  const responseData: unknown = await response.json();

  return parseGoogleBooksVolume(responseData);
}
