"use client";

import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function PrivacyPage() {
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
        <h1 className="font-display text-3xl font-bold tracking-tight mb-8">Privacy Policy</h1>

        <div className="space-y-6 text-sm text-[#44403C] leading-relaxed">
          <p className="font-mono text-xs text-muted">Last Updated: August 25, 2026</p>

          <section className="space-y-3">
            <h2 className="font-display text-lg font-bold text-foreground">1. Information We Collect</h2>
            <p>
              HostelSync collects information necessary to register accounts and track hostel maintenance requests. This includes your name, institutional email address, organization role (student or administrator), and assigned hostel room details.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-lg font-bold text-foreground">2. How We Use Information</h2>
            <p>
              Your account details are used exclusively to process complaints, assign priority values, and update status timelines. We do not sell or share your data with external third parties. All database records are synced with our secure database instances.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-lg font-bold text-foreground">3. Security and Storage</h2>
            <p>
              HostelSync uses Supabase for user authentication and relational database storage. All session information and passwords are encrypted in transit and at rest. We retain records of filed complaints for audit purposes and administrative transparency.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-lg font-bold text-foreground">4. Your Rights</h2>
            <p>
              You have the right to request access to your logged history and correct registration details via your student dashboard. For deletion requests or complete records extraction, please contact the chief hostel administrator.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-6 mt-12">
        <div className="mx-auto max-w-7xl px-5 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-mono text-[11px] text-muted">© 2026 HostelSync</p>
          <div className="flex gap-4 text-xs font-mono text-muted">
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
            <Link href="/" className="hover:text-foreground">Home</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
