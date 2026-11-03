import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth/admin";
import { getEndorphinsActivities } from "@/lib/integrations/endorphins/client";

export async function GET() {
  await requireAdmin();

  try {
    const activities = await getEndorphinsActivities();

    return NextResponse.json({ activities });
  } catch (error) {
    console.error("Endorphins activities request failed:", error);

    return NextResponse.json(
      { error: "Failed to retrieve Endorphins activities" },
      { status: 500 },
    );
  }
}