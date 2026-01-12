"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, UserPlus, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";

const schema = z.object({
  name: z.string().min(3, "Name is required"),
  email: z.string().email("Enter a valid email"),
  password: z
    .string()
    .min(8, "Min 8 characters")
    .regex(/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/, "Include uppercase, number, special char"),
  hostel: z.string().min(2, "Hostel is required"),
  room: z.string().optional(),
  role: z.enum(["student", "admin"]),
  accept: z.literal(true, { message: "Please accept terms" }),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: "student" },
  });

  const onSubmit = async (values: FormData) => {
    setSubmitting(true);
    setErrorMessage(null);
    setInfoMessage(null);

    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          name: values.name,
          hostel: values.hostel,
          room: values.room,
          role: values.role,
        },
      },
    });

    if (error) {
      setErrorMessage(error.message);
      setSubmitting(false);
      return;
    }

    const role = (data.user?.user_metadata?.role as "admin" | "student") ?? values.role;

    if (data.session) {
      router.push(`/dashboard/${role === "admin" ? "admin" : "student"}`);
      return;
    }

    setInfoMessage("Check your email to confirm your account.");
    setSubmitting(false);
  };

  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden transition-colors">
      {/* Background Orbs */}
      <div className="fixed -top-24 -left-24 h-96 w-96 rounded-full bg-blue-500/10 dark:bg-blue-600/5 blur-3xl transition-colors" />
      <div className="fixed top-1/2 -right-24 h-96 w-96 rounded-full bg-blue-500/10 dark:bg-blue-600/5 blur-3xl transition-colors" />

      <div className="relative flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group mb-8 flex items-center gap-2 self-start rounded-full bg-background/50 px-4 py-2 text-sm font-bold text-muted backdrop-blur-md transition-all hover:bg-background hover:text-blue-600 sm:fixed sm:left-8 sm:top-8 sm:mb-0"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back
        </Link>

        <div className="w-full max-w-2xl animate-fade-in">
          <div className="glass overflow-hidden rounded-[2.5rem] border border-white/50 bg-white/70 shadow-2xl backdrop-blur-xl">
            <div className="p-8 md:p-12">
              <div className="mb-10 flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
                  <UserPlus className="h-8 w-8" />
                </div>
                <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
                  Join HostelSync
                </h1>
                <p className="mt-2 text-muted">Create your account to start managing complaints</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-bold text-foreground">Full Name</label>
                    <Input
                      placeholder="e.g. Aarav Mehta"
                      className="h-12 rounded-xl"
                      {...register("name")}
                    />
                    {errors.name && <p className="mt-1 text-xs font-medium text-red-500">{errors.name.message}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-bold text-foreground">Email Address</label>
                    <Input
                      type="email"
                      placeholder="you@college.edu"
                      className="h-12 rounded-xl"
                      {...register("email")}
                    />
                    {errors.email && <p className="mt-1 text-xs font-medium text-red-500">{errors.email.message}</p>}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-foreground">Password</label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="h-12 rounded-xl"
                      {...register("password")}
                    />
                    {errors.password && <p className="mt-1 text-xs font-medium text-red-500">{errors.password.message}</p>}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-foreground">Organization Role</label>
                    <Select
                      className="h-12 rounded-xl"
                      {...register("role")}
                    >
                      <option value="student">Student User</option>
                      <option value="admin">Administrator</option>
                    </Select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-foreground">Hostel Name</label>
                    <Input
                      placeholder="e.g. Block A"
                      className="h-12 rounded-xl"
                      {...register("hostel")}
                    />
                    {errors.hostel && <p className="mt-1 text-xs font-medium text-red-500">{errors.hostel.message}</p>}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-foreground">Room Number</label>
                    <Input
                      placeholder="e.g. 203"
                      className="h-12 rounded-xl"
                      {...register("room")}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3 rounded-xl bg-card p-4 transition-colors">
                    <div className="mt-0.5">
                      <input
                        type="checkbox"
                        className="h-5 w-5 rounded-lg border-border text-blue-600 focus:ring-blue-500/20 bg-background"
                        {...register("accept")}
                      />
                    </div>
                    <label className="text-sm font-medium leading-relaxed text-muted">
                      I agree to the <Link href="#" className="font-bold text-blue-600 hover:underline">Terms of Service</Link> and <Link href="#" className="font-bold text-blue-600 hover:underline">Privacy Policy</Link>.
                    </label>
                  </div>
                  {errors.accept && <p className="text-xs font-medium text-red-500">{errors.accept.message}</p>}
                </div>

                {errorMessage && (
                  <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600">
                    <ShieldCheck className="h-4 w-4" />
                    {errorMessage}
                  </div>
                )}

                {infoMessage && (
                  <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-sm font-medium text-emerald-600">
                    <ShieldCheck className="h-4 w-4" />
                    {infoMessage}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={submitting}
                  className="h-12 w-full rounded-xl bg-blue-600 text-base font-bold text-white shadow-lg shadow-blue-100 transition-all hover:bg-blue-700 hover:shadow-blue-200 active:scale-[0.98]"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Creating account...
                    </span>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-sm font-medium text-muted">
                  Already have an account?{" "}
                  <Link href="/auth/login" className="font-bold text-blue-600 hover:underline">
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
