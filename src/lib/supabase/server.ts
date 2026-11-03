import "server-only";

import { createClient } from "@supabase/supabase-js";

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getSupabaseAdmin() {
  const supabaseUrl = getRequiredEnv("SUPABASE_URL");
  const supabaseSecretKey = getRequiredEnv("SUPABASE_SECRET_KEY");

  return createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}
