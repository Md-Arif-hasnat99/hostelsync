"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
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
  role: z.enum(["student", "admin"]),
  hostel: z.string().optional(),
  room: z.string().optional(),
  accept: z.literal(true, { message: "Please accept terms" }),
}).superRefine((data, ctx) => {
  if (data.role === "student") {
    if (!data.hostel || data.hostel.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Hostel is required",
        path: ["hostel"],
      });
    }
  }
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: "student" },
  });

  const selectedRole = watch("role");

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
    <div className="min-h-screen bg-background flex flex-col">

      {/* Plain top bar */}
      <div className="border-b border-border px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
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
      <div className="flex flex-1 items-start justify-center px-4 pt-12 pb-12 animate-fade-in">
        <div className="w-full max-w-lg">

          {/* Form header */}
          <div className="mb-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#8B2326] mb-2">
              New Account Registration
            </p>
            <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">
              Create Account
            </h1>
            <p className="mt-1.5 text-[13px] text-muted">
              Register to file and track hostel complaints
            </p>
          </div>

          {/* Bordered form panel */}
          <div className="border border-border bg-card p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                <div className="md:col-span-2 space-y-1.5">
                  <Input
                    label="Full Name"
                    placeholder="e.g. Rahul Nair"
                    {...register("name")}
                  />
                  {errors.name && <p className="font-mono text-[11px] text-[#8B2326]">{errors.name.message}</p>}
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="you@college.edu"
                    {...register("email")}
                  />
                  {errors.email && <p className="font-mono text-[11px] text-[#8B2326]">{errors.email.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-bold uppercase tracking-wider text-[#44403C]">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="w-full border border-border bg-card px-3 py-2.5 text-sm transition-all focus:border-[#1C1917] focus:outline-none focus:ring-1 focus:ring-[#1C1917]/20 placeholder:text-muted text-foreground rounded-[2px] pr-9"
                        {...register("password")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="font-mono text-[11px] text-[#8B2326]">{errors.password.message}</p>}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Select label="Account Role" {...register("role")}>
                    <option value="student">Student / Resident</option>
                    <option value="admin">Administrator / Warden</option>
                  </Select>
                </div>

                {selectedRole === "student" && (
                  <>
                    <div className="space-y-1.5">
                      <Input
                        label="Hostel Block"
                        placeholder="e.g. Block A, Block C"
                        {...register("hostel")}
                      />
                      {errors.hostel && <p className="font-mono text-[11px] text-[#8B2326]">{errors.hostel.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <Input
                        label="Room Number"
                        placeholder="e.g. 214, 302B"
                        {...register("room")}
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Terms */}
              <div className="border border-border bg-background p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-3.5 w-3.5 border-border accent-[#1C1917] shrink-0"
                    {...register("accept")}
                  />
                  <span className="text-[12px] leading-relaxed text-muted">
                    I agree to the{" "}
                    <Link href="#" className="text-foreground underline underline-offset-2">Terms of Service</Link>
                    {" "}and{" "}
                    <Link href="#" className="text-foreground underline underline-offset-2">Privacy Policy</Link>.
                  </span>
                </label>
                {errors.accept && <p className="font-mono text-[11px] text-[#8B2326] mt-2">{errors.accept.message}</p>}
              </div>

              {errorMessage && (
                <div className="border border-[#8B2326] bg-[#F2E4E4] p-3 flex items-start gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#8B2326] mt-0.5 shrink-0" />
                  <p className="font-mono text-[11px] text-[#8B2326]">{errorMessage}</p>
                </div>
              )}

              {infoMessage && (
                <div className="border border-[#14532D] bg-[#DCFCE7] p-3 flex items-start gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#14532D] mt-0.5 shrink-0" />
                  <p className="font-mono text-[11px] text-[#14532D]">{infoMessage}</p>
                </div>
              )}

              <Button type="submit" disabled={submitting} className="w-full h-11">
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#F5F0E8]/30 border-t-[#F5F0E8]" />
                    Creating account…
                  </span>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          </div>

          <p className="mt-5 font-mono text-[11px] text-muted text-center">
            Already registered?{" "}
            <Link href="/auth/login" className="text-foreground underline underline-offset-2">
              Sign in here
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
