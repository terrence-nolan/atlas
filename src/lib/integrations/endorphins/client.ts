import "server-only";

import { getEndorphinsAccessToken } from "./token";
import type {
  EndorphinsActivitiesResponse,
  EndorphinsActivity,
} from "./types";

const API_BASE_URL = "https://endorphinsrunning.com/gpt";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isEndorphinsActivity(value: unknown): value is EndorphinsActivity {
  if (!isRecord(value)) return false;

  return (
    typeof value._id === "string" &&
    typeof value.activity_id === "string" &&
    typeof value.activitySource === "string" &&
    typeof value.name === "string" &&
    typeof value.type === "string" &&
    typeof value.start_date === "string" &&
    typeof value.start_date_local === "string" &&
    typeof value.distance === "number" &&
    typeof value.distance_kilometers === "number" &&
    typeof value.distance_miles === "number" &&
    typeof value.moving_time === "number" &&
    typeof value.elapsed_time === "number" &&
    isRecord(value.privacy)
  );
}

function parseActivitiesResponse(
  value: unknown,
): EndorphinsActivitiesResponse {
  if (!isRecord(value) || !Array.isArray(value.activities)) {
    throw new Error("Endorphins returned an invalid activities response");
  }

  if (!value.activities.every(isEndorphinsActivity)) {
    throw new Error("Endorphins returned an invalid activity");
  }

  return {
    activities: value.activities,
  };
}

export async function getEndorphinsActivities(
  days = 120,
): Promise<EndorphinsActivity[]> {
  if (!Number.isInteger(days) || days < 1 || days > 365) {
    throw new Error("Activity history must be between 1 and 365 days");
  }

  const accessToken = await getEndorphinsAccessToken();

  const url = new URL(`${API_BASE_URL}/activities`);
  url.searchParams.set("days", String(days));

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const responseBody = await response.text();

    console.error("Endorphins API error:", {
      status: response.status,
      statusText: response.statusText,
      body: responseBody,
    });

    throw new Error(
      `Endorphins activities request failed with status ${response.status}`,
    );
  }

  const responseData: unknown = await response.json();
  const parsedResponse = parseActivitiesResponse(responseData);

  return parsedResponse.activities;
}