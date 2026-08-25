"use client";

import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { Sun, Moon, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

// Static ledger entries — realistic hostel complaint data
const sampleEntries = [
  { id: "HC-2847", date: "25 Aug", category: "Water Supply",  title: "No hot water in Block C showers",      status: "pending",     priority: "urgent" },
  { id: "HC-2846", date: "25 Aug", category: "Internet/WiFi",  title: "Router offline — Floor 3, Block A",   status: "in_progress", priority: "normal" },
  { id: "HC-2844", date: "24 Aug", category: "Electricity",    title: "Corridor light blown — B-Wing stairwell", status: "in_progress", priority: "urgent" },
  { id: "HC-2841", date: "24 Aug", category: "Cleanliness",    title: "Common washroom not cleaned",          status: "pending",     priority: "normal" },
  { id: "HC-2839", date: "23 Aug", category: "Maintenance",    title: "Broken latch — Room 214, Block B",    status: "resolved",    priority: "normal" },
  { id: "HC-2835", date: "23 Aug", category: "Food Quality",   title: "Mess dinner — undercooked rice (again)", status: "resolved", priority: "normal" },
];

const statusLabel: Record<string, string> = {
  pending: "PENDING",
  in_progress: "IN PROG.",
  resolved: "RESOLVED",
};

const statusColor: Record<string, string> = {
  pending:     "text-[#92400E] border-[#92400E]",
  in_progress: "text-[#44403C] border-[#44403C]",
  resolved:    "text-[#14532D] border-[#14532D]",
};

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── Header ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-5 md:px-8">
          <div className="flex items-center gap-2">
            <Logo size={28} showText={false} />
            <span className="font-mono text-sm font-bold tracking-widest uppercase text-foreground">
              Hostel<span className="text-[#8B2326]">Sync</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-7 text-[13px] font-medium text-muted">
            <Link href="#how-it-works" className="hover:text-foreground transition-colors">How it works</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <div className="h-4 w-px bg-border" />
            {mounted && (
              <button
                onClick={toggleTheme}
                className="p-1.5 text-muted hover:text-foreground transition-colors"
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </button>
            )}
            <Link href="/auth/login" className="hover:text-foreground transition-colors">Log In</Link>
            <Button asChild size="sm" variant="outline">
              <Link href="/auth/register">Register</Link>
            </Button>
          </nav>

          {/* Mobile header controls */}
          <div className="flex items-center gap-3 md:hidden">
            {mounted && (
              <button onClick={toggleTheme} className="p-1.5 text-muted hover:text-foreground">
                {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </button>
            )}
            <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="p-1.5 text-foreground">
              {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-border bg-background animate-fade-in">
            <nav className="flex flex-col p-5 gap-4 text-sm font-medium">
              <Link href="#how-it-works" onClick={() => setShowMobileMenu(false)} className="text-muted hover:text-foreground">How it works</Link>
              <Link href="/privacy" onClick={() => setShowMobileMenu(false)} className="text-muted hover:text-foreground">Privacy Policy</Link>
              <Link href="/terms" onClick={() => setShowMobileMenu(false)} className="text-muted hover:text-foreground">Terms & Conditions</Link>
              <div className="h-px bg-border" />
              <Link href="/auth/login" onClick={() => setShowMobileMenu(false)}>Log In</Link>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/auth/register" onClick={() => setShowMobileMenu(false)}>Register</Link>
              </Button>
            </nav>
          </div>
        )}
      </header>

      <main>

        {/* ── Hero ─────────────────────────────────────────── */}
        <section className="mx-auto max-w-7xl px-5 md:px-8 py-14 md:py-20 animate-fade-in">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-16 items-start">

            {/* Left: headline + CTAs */}
            <div className="flex flex-col gap-8 pt-2">
              <div>
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[#8B2326] mb-4">
                  Complaint Register — Academic Year 2025–26
                </p>
                <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground leading-[1.1] tracking-tight">
                  File. Track.<br />
                  <span className="text-[#8B2326]">Resolve.</span>
                </h1>
                <p className="mt-5 text-[15px] leading-relaxed text-muted max-w-sm">
                  A structured complaint register for hostel residents and wardens. No follow-up calls,
                  no lost slips — every issue logged, timestamped, and traceable.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="md" variant="primary">
                  <Link href="/auth/register">Open Student Account</Link>
                </Button>
                <Button asChild size="md" variant="outline">
                  <Link href="/auth/login?role=admin">Admin Portal →</Link>
                </Button>
              </div>

              {/* Stats tally */}
              <div className="grid grid-cols-3 border border-border divide-x divide-border mt-2">
                <div className="px-4 py-3">
                  <p className="font-mono text-2xl font-bold text-foreground">847</p>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted mt-0.5">Logged</p>
                </div>
                <div className="px-4 py-3">
                  <p className="font-mono text-2xl font-bold text-foreground">793</p>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted mt-0.5">Resolved</p>
                </div>
                <div className="px-4 py-3">
                  <p className="font-mono text-2xl font-bold text-[#8B2326]">54</p>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted mt-0.5">Open</p>
                </div>
              </div>
            </div>

            {/* Right: live-looking ledger */}
            <div className="border border-border bg-card">
              {/* Ledger header */}
              <div className="border-b border-border px-5 py-3 flex items-center justify-between bg-background">
                <span className="font-mono text-[11px] uppercase tracking-widest text-muted">
                  Recent Entries — Block A/B/C
                </span>
                <span className="font-mono text-[10px] text-muted">
                  {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                </span>
              </div>

              {/* Column headers */}
              <div className="grid grid-cols-[3.5rem_1fr_auto] border-b border-border bg-background/60 px-5 py-2 gap-4">
                <span className="font-mono text-[9px] uppercase tracking-widest text-muted">Ref No.</span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-muted">Issue / Category</span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-muted">Status</span>
              </div>

              {/* Entries */}
              {sampleEntries.map((entry, i) => (
                <div
                  key={entry.id}
                  className={`grid grid-cols-[3.5rem_1fr_auto] items-start gap-4 px-5 py-3.5 border-l-[3px] ${
                    entry.priority === "urgent" ? "border-l-[#8B2326]" : "border-l-transparent"
                  } ${i < sampleEntries.length - 1 ? "border-b border-border" : ""}`}
                >
                  <div>
                    <p className="font-mono text-[10px] font-bold text-muted">{entry.id}</p>
                    <p className="font-mono text-[9px] text-muted/60 mt-0.5">{entry.date}</p>
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-foreground leading-snug">{entry.title}</p>
                    <p className="font-mono text-[9px] uppercase tracking-wider text-muted mt-0.5">{entry.category}</p>
                  </div>
                  <div className="pt-0.5">
                    <span className={`font-mono text-[9px] font-bold tracking-widest border px-1.5 py-0.5 rounded-[1px] ${statusColor[entry.status]}`}>
                      {statusLabel[entry.status]}
                    </span>
                  </div>
                </div>
              ))}

              <div className="border-t border-border px-5 py-2.5 bg-background/60">
                <span className="font-mono text-[9px] text-muted tracking-widest uppercase">
                  Showing 6 of 54 open entries · Sorted by date desc
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Divider ─────────────────────────────────────── */}
        <div className="border-t border-border" />

        {/* ── How it works ────────────────────────────────── */}
        <section id="how-it-works" className="mx-auto max-w-7xl px-5 md:px-8 py-16 md:py-20">
          <div className="mb-12">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted mb-2">The system</p>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">How HostelSync works</h2>
          </div>

          <div className="grid gap-0 md:grid-cols-3 border border-border divide-y md:divide-y-0 md:divide-x divide-border">
            {[
              {
                n: "01",
                role: "Student files a complaint",
                desc: "Select category (Water Supply, Electricity, Internet/WiFi, Food Quality, Cleanliness, Maintenance), describe the issue, mark urgency. Complaint is logged with an auto-assigned reference number and timestamp.",
              },
              {
                n: "02",
                role: "Admin triages the register",
                desc: "Warden or hostel manager reviews the live register, updates status to In Progress, assigns internally. Real-time sync means no stale views — changes propagate instantly.",
              },
              {
                n: "03",
                role: "Issue resolved, record closed",
                desc: "Once resolved, admin marks the ticket Closed. Student sees the status update immediately. Full audit trail preserved — every complaint permanently on record.",
              },
            ].map(item => (
              <div key={item.n} className="p-6 md:p-8">
                <p className="font-mono text-[11px] font-bold text-[#8B2326] tracking-widest mb-4">{item.n}</p>
                <h3 className="font-display text-base font-bold text-foreground mb-2">{item.role}</h3>
                <p className="text-[14px] leading-relaxed text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Divider ─────────────────────────────────────── */}
        <div className="border-t border-border" />

        {/* ── Categories ──────────────────────────────────── */}
        <section className="mx-auto max-w-7xl px-5 md:px-8 py-12">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted mb-5">Tracked categories</p>
          <div className="flex flex-wrap gap-2">
            {["Water Supply", "Electricity", "Internet / WiFi", "Food Quality", "Cleanliness", "Maintenance"].map(cat => (
              <span key={cat} className="font-mono text-[11px] uppercase tracking-wider border border-border px-3 py-1.5 text-muted hover:text-foreground hover:border-foreground transition-colors cursor-default">
                {cat}
              </span>
            ))}
          </div>
        </section>

      </main>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-5 md:px-8 py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-center gap-2">
            <Logo size={22} showText={false} />
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-foreground">
              Hostel<span className="text-[#8B2326]">Sync</span>
            </span>
          </div>
          <div className="flex gap-6 text-[12px] text-muted font-medium">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
            <a href="mailto:warden@hostelsync.edu?subject=HostelSync%20Support%20Request&body=Dear%20Warden%2C%0A%0AI%20am%20writing%20to%20you%20regarding..." className="hover:text-foreground transition-colors">Contact Warden</a>
          </div>
          <p className="font-mono text-[11px] text-muted">
            © 2026 HostelSync
          </p>
        </div>
      </footer>

    </div>
  );
}
