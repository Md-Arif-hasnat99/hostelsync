import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const REMEMBER_KEY = "hostelapp:remember";

const getAdaptiveStorage = () => {
  if (typeof window === "undefined") return undefined;

  const getStore = () => (window.localStorage.getItem(REMEMBER_KEY) === "true" ? window.localStorage : window.sessionStorage);

  return {
    getItem: (key: string) => getStore().getItem(key),
    setItem: (key: string, value: string) => getStore().setItem(key, value),
    removeItem: (key: string) => {
      // Clear both stores to avoid stale sessions when toggling remember me.
      window.localStorage.removeItem(key);
      window.sessionStorage.removeItem(key);
    },
  } satisfies Pick<Storage, "getItem" | "setItem" | "removeItem">;
};

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase environment variables are missing");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storage: getAdaptiveStorage(),
    autoRefreshToken: true,
  },
});

export const rememberStorageKey = REMEMBER_KEY;
