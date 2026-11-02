import { afterAll, afterEach, beforeAll } from "vitest";
import { setupServer } from "msw/node";

import { handlers as githubHandlers } from "@/lib/integrations/github/mocks/handlers";

export const server = setupServer(...githubHandlers);

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