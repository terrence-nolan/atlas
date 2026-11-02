import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export async function createSupabaseAuthClient() {
  const supabaseUrl = getRequiredEnv("SUPABASE_URL");
  const supabasePublishableKey = getRequiredEnv(
    "SUPABASE_PUBLISHABLE_KEY",
  );

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },

      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot write cookies.
          // Session refresh is handled by the Next.js Proxy.
        }
      },
    },
  });
}
