import { http, HttpResponse } from "msw";

import { mockRepositoryResponse } from "./fixtures/repository";

export const handlers = [
  http.get(
    "https://api.github.com/repos/:owner/:repo",
    () => {
      return HttpResponse.json(mockRepositoryResponse);
    },
  ),
];