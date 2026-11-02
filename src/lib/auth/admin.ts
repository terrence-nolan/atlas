import "server-only";

import { redirect } from "next/navigation";

import { createSupabaseAuthClient } from "@/lib/supabase/auth-server";

function getAdminUserId(): string {
  const userId = process.env.ADMIN_USER_ID;

  if (!userId) {
    throw new Error("Missing required environment variable: ADMIN_USER_ID");
  }

  return userId;
}

export async function requireAdmin(): Promise<void> {
  const supabase = await createSupabaseAuthClient();

  const { data, error } = await supabase.auth.getClaims();

  if (error || data?.claims?.sub !== getAdminUserId()) {
    redirect("/admin/login");
  }
}
