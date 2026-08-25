"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/sign-up");
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 border-2 border-border border-t-[#1C1917] rounded-full animate-spin" />
        <p className="font-mono text-[11px] uppercase tracking-widest text-muted">Redirecting to Sign Up…</p>
      </div>
    </div>
  );
}
