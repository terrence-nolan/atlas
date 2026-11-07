import { describe, expect, it, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";

import { getGoogleBooksVolume } from "./client";
import { mockVolumeResponse } from "./mocks/fixtures/volume";
import { server } from "../../../../tests/setup/msw";

describe("getGoogleBooksVolume", () => {
  beforeEach(() => {
    process.env.GOOGLE_BOOKS_API_KEY = "test-api-key";
  });

  it("returns the parsed volume", async () => {
    const result = await getGoogleBooksVolume("test-volume-id");

    expect(result).toEqual(mockVolumeResponse);
  });

  it("throws when the volume ID is empty", async () => {
    await expect(getGoogleBooksVolume("")).rejects.toThrow(
      "Google Books volume ID cannot be empty",
    );
  });

  it("throws when the request fails", async () => {
    server.use(
      http.get(
        "https://www.googleapis.com/books/v1/volumes/:volumeId",
        () => {
          return new HttpResponse(null, { status: 404 });
        },
      ),
    );

    await expect(
      getGoogleBooksVolume("invalid-volume-id"),
    ).rejects.toThrow(
      "Google Books volume request failed with status 404",
    );
  });

  it("throws when the response does not contain a valid volume", async () => {
    server.use(
      http.get(
        "https://www.googleapis.com/books/v1/volumes/:volumeId",
        () => {
          return HttpResponse.json({
            id: "test-volume-id",
          });
        },
      ),
    );

    await expect(
      getGoogleBooksVolume("test-volume-id"),
    ).rejects.toThrow(
      "Google Books returned an invalid volume response",
    );
  });

  it("returns a volume when optional metadata is missing", async () => {
    server.use(
      http.get(
        "https://www.googleapis.com/books/v1/volumes/:volumeId",
        () => {
          return HttpResponse.json({
            id: "test-volume-id",
            volumeInfo: {
              title: "Atomic Habits",
            },
          });
        },
      ),
    );

    const result = await getGoogleBooksVolume("test-volume-id");

    expect(result).toEqual({
      id: "test-volume-id",
      volumeInfo: {
        title: "Atomic Habits",
      },
    });
  });

  it("ignores optional metadata with invalid types", async () => {
    server.use(
      http.get(
        "https://www.googleapis.com/books/v1/volumes/:volumeId",
        () => {
          return HttpResponse.json({
            id: "test-volume-id",
            volumeInfo: {
              title: 123,
              authors: "James Clear",
              pageCount: -10,
              imageLinks: {
                thumbnail: 123,
              },
            },
          });
        },
      ),
    );

    const result = await getGoogleBooksVolume("test-volume-id");

    expect(result).toEqual({
      id: "test-volume-id",
      volumeInfo: {},
    });
  });

  it("throws when the API key is not configured", async () => {
  delete process.env.GOOGLE_BOOKS_API_KEY;

  await expect(
    getGoogleBooksVolume("test-volume-id"),
  ).rejects.toThrow("GOOGLE_BOOKS_API_KEY is not configured");
});
});
