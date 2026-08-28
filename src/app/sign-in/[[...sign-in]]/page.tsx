"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { createClient } from "@/lib/supabase";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* HostelSync header bar */}
      <div className="border-b border-border px-6 py-4 flex items-center justify-between bg-background">
        <Link href="/" className="flex items-center gap-2">
          <Logo size={24} showText={false} />
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-foreground">
            Hostel<span className="text-[#8B2326]">Sync</span>
          </span>
        </Link>
        <Link
          href="/"
          className="font-mono text-[11px] uppercase tracking-widest text-muted hover:text-foreground transition-colors"
        >
          ← Back
        </Link>
      </div>

      {/* Form area */}
      <div className="flex flex-1 items-start justify-center px-4 pt-14 pb-12">
        <div className="w-full max-w-sm">
          <div className="mb-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#8B2326] mb-2">
              Complaint Register
            </p>
            <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">
              Sign In
            </h1>
            <p className="mt-1.5 text-[13px] text-muted">
              Enter your credentials to access your account
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="border border-border bg-card rounded-[2px] p-6 flex flex-col gap-4"
          >
            {error && (
              <p className="font-mono text-[11px] text-[#8B2326] border border-[#8B2326]/30 bg-[#8B2326]/5 px-3 py-2 rounded-[2px]">
                {error}
              </p>
            )}

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-[12px] font-bold uppercase tracking-wider text-[#44403C]"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border border-border bg-card rounded-[2px] text-foreground text-sm px-3 py-2 placeholder:text-muted focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20"
                placeholder="you@example.com"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-[12px] font-bold uppercase tracking-wider text-[#44403C]"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border border-border bg-card rounded-[2px] text-foreground text-sm px-3 py-2 placeholder:text-muted focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 bg-foreground text-background hover:bg-foreground/90 rounded-[2px] font-bold tracking-wide py-2.5 text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>

            <p className="text-center font-mono text-xs text-muted">
              No account?{" "}
              <Link
                href="/sign-up"
                className="text-foreground underline underline-offset-2"
              >
                Register here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
