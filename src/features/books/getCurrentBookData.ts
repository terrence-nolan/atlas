import "server-only";

import { mockCurrentBook } from "./mocks/current-book";
import { getCurrentBook } from "./getCurrentBook";
import { selectDataSource } from "@/lib/data/selectDataSource";

export function getCurrentBookData() {
  return selectDataSource({
    mock: () => mockCurrentBook,
    live: getCurrentBook,
  });
}
