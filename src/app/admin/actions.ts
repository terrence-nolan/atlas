"use server";

import { redirect } from "next/navigation";

import { createSupabaseAuthClient } from "@/lib/supabase/auth-server";

export async function signOut() {
  const supabase = await createSupabaseAuthClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }

  redirect("/admin/login");
}