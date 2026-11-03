"use server";

import { redirect } from "next/navigation";

import { createSupabaseAuthClient } from "@/lib/supabase/auth-server";

export interface LoginState {
  error?: string;
}

export async function login(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = formData.get("email");
  const password = formData.get("password");

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email.trim() ||
    !password
  ) {
    return { error: "Please enter your email and password." };
  }

  const supabase = await createSupabaseAuthClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error || !data.user) {
    return { error: "Invalid email or password." };
  }

  if (data.user.id !== process.env.ADMIN_USER_ID) {
    await supabase.auth.signOut();

    return { error: "Invalid email or password." };
  }

  redirect("/admin");
}
