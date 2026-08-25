"use client";

import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-5 md:px-8">
          <Link href="/" className="flex items-center gap-2">
            <Logo size={28} showText={false} />
            <span className="font-mono text-sm font-bold tracking-widest uppercase text-foreground">
              Hostel<span className="text-[#8B2326]">Sync</span>
            </span>
          </Link>
          <Link href="/" className="font-mono text-[11px] uppercase tracking-widest text-muted hover:text-foreground transition-colors">
            ← Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl mx-auto px-5 py-12 md:py-16 animate-fade-in">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#8B2326] mb-2">Legal Documents</p>
        <h1 className="font-display text-3xl font-bold tracking-tight mb-8">Terms and Conditions</h1>

        <div className="space-y-6 text-sm text-[#44403C] leading-relaxed">
          <p className="font-mono text-xs text-muted">Last Updated: August 25, 2026</p>

          <section className="space-y-3">
            <h2 className="font-display text-lg font-bold text-foreground">1. Agreement to Terms</h2>
            <p>
              By creating an account on HostelSync, you agree to these Terms and Conditions. These terms govern the use of the platform for filing complaints, triaging requests, and communications between students and hostel wardens.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-lg font-bold text-foreground">2. User Account Responsibilities</h2>
            <p>
              Users are responsible for maintaining the confidentiality of their login credentials. All complaints filed under your account will be attributed to you. You agree to submit truthful, accurate, and non-frivolous complaints related to the actual maintenance conditions of your hostel block.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-lg font-bold text-foreground">3. Acceptable Use Policy</h2>
            <p>
              You agree not to use the platform to harass, spam, or submit fake/malicious entries to abuse system resources. Violating this policy may result in immediate suspension of your registration by the administration.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-lg font-bold text-foreground">4. Platform Administration Rights</h2>
            <p>
              Hostel managers and wardens retain the right to edit category classifications, adjust priority urgencies, merge duplicate complaints, and close resolved tickets in accordance with hostel administration policies.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-6 mt-12">
        <div className="mx-auto max-w-7xl px-5 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-mono text-[11px] text-muted">© 2026 HostelSync</p>
          <div className="flex gap-4 text-xs font-mono text-muted">
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/" className="hover:text-foreground">Home</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
