"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { createClient } from "@/lib/supabase";

export default function SignUpPage() {
  const router = useRouter();
  const [role, setRole] = useState<"student" | "admin">("student");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setNotice("Please check your email to confirm your registration.");
      setLoading(false);
    }
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
              New Account Registration
            </p>
            <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">
              Create Account
            </h1>
            <p className="mt-1.5 text-[13px] text-muted">
              Select your registration role below to begin
            </p>
          </div>

          {/* Role toggle */}
          <div className="flex border border-border rounded-[2px] overflow-hidden mb-6 p-0.5 bg-background">
            <button
              type="button"
              onClick={() => setRole("student")}
              className={`flex-1 py-2 text-center font-mono text-[10px] uppercase tracking-widest transition-all ${
                role === "student"
                  ? "bg-foreground text-background font-bold"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => setRole("admin")}
              className={`flex-1 py-2 text-center font-mono text-[10px] uppercase tracking-widest transition-all ${
                role === "admin"
                  ? "bg-foreground text-background font-bold"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Warden / Admin
            </button>
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

            {notice && (
              <p className="font-mono text-[11px] text-[#14532D] border border-[#14532D]/30 bg-[#14532D]/5 px-3 py-2 rounded-[2px]">
                {notice}
              </p>
            )}

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="fullName"
                className="text-[12px] font-bold uppercase tracking-wider text-[#44403C]"
              >
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                autoComplete="name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="border border-border bg-card rounded-[2px] text-foreground text-sm px-3 py-2 placeholder:text-muted focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20"
                placeholder="Your full name"
              />
            </div>

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
                autoComplete="new-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border border-border bg-card rounded-[2px] text-foreground text-sm px-3 py-2 placeholder:text-muted focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20"
                placeholder="Min. 6 characters"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 bg-foreground text-background hover:bg-foreground/90 rounded-[2px] font-bold tracking-wide py-2.5 text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account…" : "Create Account"}
            </button>

            <p className="text-center font-mono text-xs text-muted">
              Already have an account?{" "}
              <Link
                href="/sign-in"
                className="text-foreground underline underline-offset-2"
              >
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
