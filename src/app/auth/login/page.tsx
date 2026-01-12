"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { rememberStorageKey, supabase } from "@/lib/supabase";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Minimum 8 characters"),
  role: z.enum(["student", "admin"]),
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
  } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { role: "student" } });

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

    const role = (data?.user?.user_metadata?.role as "admin" | "student") ?? values.role;
    router.push(`/dashboard/${role === "admin" ? "admin" : "student"}`);
    setSubmitting(false);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-12 transition-colors">
      <div className="absolute inset-0 -z-10 h-full w-full opacity-50 dark:opacity-20 [background:radial-gradient(125%_125%_at_50%_10%,transparent_40%,#3b82f6_100%)]" />
      


      <Link
        href="/"
        className="group fixed left-4 top-2 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-background/80 backdrop-blur-md border border-border shadow-sm transition-all hover:bg-background hover:border-blue-200 hover:text-blue-600 hover:shadow-md md:left-8 md:top-4"
        title="Back to Home"
      >
        <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
      </Link>

      <div className="w-full max-w-md animate-fade-in">
        <div className="glass rounded-[2rem] p-8 md:p-12 shadow-2xl">
          <div className="mb-10 flex flex-col items-center text-center">
            <Logo size={64} showText={false} className="mb-4 shadow-lg shadow-blue-200 rounded-full" />
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">Welcome back</h1>
            <p className="mt-2 text-muted">Sign in to manage your hostel requests</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@college.edu"
                className="h-12 rounded-xl"
                {...register("email")}
                aria-invalid={!!errors.email}
              />
              {errors.email && <p className="text-xs font-medium text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                className="h-12 rounded-xl"
                {...register("password")}
                aria-invalid={!!errors.password}
              />
              {errors.password && <p className="text-xs font-medium text-red-500">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <Select label="Sign in as" {...register("role")} className="h-12 rounded-xl">
                <option value="student">Student Account</option>
                <option value="admin">Administrator</option>
              </Select>
            </div>

            <div className="flex items-center justify-between py-2">
              <label className="flex items-center gap-2 text-sm font-medium text-muted cursor-pointer">
                <input type="checkbox" {...register("remember")} className="h-4 w-4 rounded border-border text-blue-600 focus:ring-blue-500 bg-background" />
                Remember me
              </label>
              <Link href="#" className="text-sm font-bold text-blue-600 hover:underline">Forgot password?</Link>
            </div>

            {errorMessage && (
              <div className="rounded-xl bg-red-50 p-4 text-center text-sm font-medium text-red-600">
                {errorMessage}
              </div>
            )}

            <Button type="submit" disabled={submitting} className="h-12 w-full rounded-xl text-base shadow-lg shadow-blue-100">
              {submitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="font-bold text-blue-600 hover:underline">
              Create one now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
