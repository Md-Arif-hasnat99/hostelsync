import { createClient } from "@supabase/supabase-js";

// Anon client — used ONLY for Supabase Realtime subscriptions.
// All data reads/writes go through server actions using the service role client.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase environment variables are missing");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});
