import { http, HttpResponse } from "msw";

import { mockActivitiesResponse } from "./fixtures/activities";

export const handlers = [
  http.get(
    "https://endorphinsrunning.com/gpt/activities",
    () => HttpResponse.json(mockActivitiesResponse),
  ),
];
