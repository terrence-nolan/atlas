import { afterAll, afterEach, beforeAll } from "vitest";
import { setupServer } from "msw/node";

import { handlers as githubHandlers } from "@/lib/integrations/github/mocks/handlers";
import { handlers as endorphinsHandlers } from "@/lib/integrations/endorphins/mocks/handlers";
import { handlers as googleBooksHandlers } from "@/lib/integrations/google-books/mocks/handlers";

export const server = setupServer(
  ...githubHandlers,
  ...endorphinsHandlers,
  ...googleBooksHandlers,
);

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
