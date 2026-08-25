import { createClient } from "@supabase/supabase-js";

// Server-only Supabase client using the service role key.
// Bypasses all Row Level Security — must only be used from Server Actions or API Routes,
// never imported into client components.
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set"
    );
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}
