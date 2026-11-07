import "server-only";

import { cacheLife } from "next/cache";

import currentBookJson from "@/content/books/current-book.json";
import { getGoogleBooksVolume } from "@/lib/integrations/google-books/client";

import { currentBookConfigSchema } from "./schema";
import { formatBook } from "./format-book";
import type { CurrentBook } from "./types";

export async function getCurrentBook(): Promise<CurrentBook> {
  "use cache";
  cacheLife("days");

  const currentBookConfig =
    currentBookConfigSchema.parse(currentBookJson);

  const volume = await getGoogleBooksVolume(
    currentBookConfig.googleBooksId,
  );

  return {
    ...formatBook(volume),
    ...currentBookConfig,
  };
}
