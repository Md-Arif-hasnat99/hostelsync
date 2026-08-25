"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { rememberStorageKey, supabase } from "@/lib/supabase";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Minimum 8 characters"),
  remember: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormData) => {
    setSubmitting(true);
    setErrorMessage(null);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(rememberStorageKey, values.remember ? "true" : "false");
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      setErrorMessage(error.message);
      setSubmitting(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profileError || !profile) {
      setErrorMessage("User profile not found. Contact administration.");
      setSubmitting(false);
      return;
    }

    router.push(`/dashboard/${profile.role}`);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* Plain top bar */}
      <div className="border-b border-border px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <Logo size={24} showText={false} />
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-foreground">
            Hostel<span className="text-[#8B2326]">Sync</span>
          </span>
        </Link>
        <Link href="/" className="font-mono text-[11px] uppercase tracking-widest text-muted hover:text-foreground transition-colors">
          ← Back
        </Link>
      </div>

      {/* Form area */}
      <div className="flex flex-1 items-start justify-center px-4 pt-16 pb-12 animate-fade-in">
        <div className="w-full max-w-sm">

          {/* Form header */}
          <div className="mb-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#8B2326] mb-2">
              Complaint Register
            </p>
            <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">Sign In</h1>
            <p className="mt-1.5 text-[13px] text-muted">
              Access your hostel complaint account
            </p>
          </div>

          {/* Bordered form panel */}
          <div className="border border-border bg-card p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="you@college.edu"
                  {...register("email")}
                  aria-invalid={!!errors.email}
                />
                {errors.email && <p className="font-mono text-[11px] text-[#8B2326]">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                  aria-invalid={!!errors.password}
                />
                {errors.password && <p className="font-mono text-[11px] text-[#8B2326]">{errors.password.message}</p>}
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-[12px] font-medium text-muted cursor-pointer">
                  <input
                    type="checkbox"
                    {...register("remember")}
                    className="h-3.5 w-3.5 border-border accent-[#1C1917]"
                  />
                  Remember me
                </label>
                <Link href="#" className="font-mono text-[11px] text-muted hover:text-foreground underline underline-offset-2">
                  Forgot password?
                </Link>
              </div>

              {errorMessage && (
                <div className="border border-[#8B2326] bg-[#F2E4E4] p-3">
                  <p className="font-mono text-[11px] text-[#8B2326]">{errorMessage}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-11 mt-2"
              >
                {submitting ? "Signing in…" : "Sign In"}
              </Button>
            </form>
          </div>

          <p className="mt-5 font-mono text-[11px] text-muted text-center">
            No account?{" "}
            <Link href="/auth/register" className="text-foreground underline underline-offset-2">
              Register here
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
