import { http, HttpResponse } from "msw";

import { mockVolumeResponse } from "./fixtures/volume";

export const handlers = [
  http.get(
    "https://www.googleapis.com/books/v1/volumes/:volumeId",
    () => {
      return HttpResponse.json(mockVolumeResponse);
    },
  ),
];
