"use client";

import { ArrowRight, ShieldCheck, Sparkles, TrendingUp, CheckCircle2, MessageSquare, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { Sun, Moon, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

const features = [
  {
    title: "Quick Reporting",
    description: "Submit hostel complaints in under 60 seconds with guided fields.",
    icon: Zap,
    color: "text-amber-500",
    bg: "bg-amber-50",
  },
  {
    title: "Real-Time Tracking",
    description: "See live status, admin updates, and timestamps at every step.",
    icon: MessageSquare,
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    title: "Fast Resolution",
    description: "Structured workflows keep admins accountable and students informed.",
    icon: CheckCircle2,
    color: "text-emerald-500",
    bg: "bg-emerald-50",
  },
];

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen selection:bg-blue-100 selection:text-blue-700 bg-background transition-colors duration-300">
      {/* Header */}
      <header className={`sticky top-0 z-[60] h-[72px] transition-all ${showMobileMenu ? 'bg-background border-b border-border' : 'glass'}`}>
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-blue-600 p-1 transition-transform group-hover:rotate-12">
               <Image src="/logo.png" alt="Hostel Sync" width={40} height={40} className="object-contain" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-foreground dark:text-white">
              Hostel<span className="text-blue-600">Sync</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-400">
            <Link href="#features" className="hover:text-blue-600 transition-colors">Features</Link>
            <Link href="#how" className="hover:text-blue-600 transition-colors">How it works</Link>
            <div className="h-4 w-px bg-slate-200" />
            
            {mounted && (
              <button 
                onClick={toggleTheme}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </button>
            )}

            <Link href="/auth/login" className="hover:text-blue-600 transition-colors">Login</Link>
            <Button asChild className="rounded-full px-6">
              <Link href="/auth/register">Get Started</Link>
            </Button>
          </nav>
          
          <div className="flex items-center gap-4 md:hidden">
            {mounted && (
              <button 
                onClick={toggleTheme}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </button>
            )}
            <button 
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 text-foreground"
            >
              {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {showMobileMenu && (
          <div className="fixed inset-x-0 bottom-0 top-[72px] z-[100] md:hidden">
            <div className="absolute inset-0 bg-background" />
            <nav className="relative flex h-full flex-col gap-8 p-8 text-xl font-bold border-t border-border animate-slide-up">
              <Link href="#features" onClick={() => setShowMobileMenu(false)} className="flex items-center justify-between hover:text-blue-600 transition-colors">
                <span>Features</span>
                <ArrowRight className="h-5 w-5 opacity-50" />
              </Link>
              <Link href="#how" onClick={() => setShowMobileMenu(false)} className="flex items-center justify-between hover:text-blue-600 transition-colors">
                <span>How it works</span>
                <ArrowRight className="h-5 w-5 opacity-50" />
              </Link>
              <div className="h-px bg-border w-full my-2" />
              <Link href="/auth/login" onClick={() => setShowMobileMenu(false)} className="hover:text-blue-600 transition-colors">Login</Link>
              <Button asChild size="lg" className="rounded-xl w-full h-14 text-lg">
                <Link href="/auth/register" onClick={() => setShowMobileMenu(false)}>Get Started</Link>
              </Button>
            </nav>
          </div>
        )}
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-16 md:pt-32 md:pb-24">
          
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex flex-col items-center text-center animate-fade-in">
              <Badge className="mb-6 rounded-full border-blue-100 bg-blue-50 px-4 py-1 text-blue-700">
                ✨ Streamline your hostel life
              </Badge>
              <h1 className="font-display max-w-4xl text-5xl font-extrabold tracking-tight text-foreground dark:text-white md:text-7xl">
                Hostel issues? <br />
                <span className="text-gradient">Track them effortlessly.</span>
              </h1>
              <p className="mt-8 max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-slate-400 md:text-xl">
                The modern complaint portal for students and admins. Experience transparent 
                tracking, real-time updates, and lightning-fast resolutions.
              </p>
              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
                <Button asChild size="lg" className="h-14 rounded-full px-8 text-base shadow-lg shadow-blue-200 hover-lift">
                  <Link href="/auth/register">
                    Start Reporting <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="lg" className="h-14 rounded-full px-8 text-base hover:bg-slate-100">
                  <Link href="/auth/login?role=admin">Admin Dashboard</Link>
                </Button>
              </div>
              
              {/* Trust/Stats */}
              <div className="mt-20 grid grid-cols-2 gap-8 md:grid-cols-3 animate-slide-up">
                <div className="flex flex-col gap-1">
                  <span className="font-display text-3xl font-bold text-foreground dark:text-white">500+</span>
                  <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Issues Resolved</span>
                </div>
                <div className="flex flex-col gap-1 border-x border-slate-200 px-8">
                  <span className="font-display text-3xl font-bold text-foreground dark:text-white">95%</span>
                  <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Satisfaction</span>
                </div>
                <div className="hidden flex-col gap-1 md:flex">
                  <span className="font-display text-3xl font-bold text-foreground dark:text-white">&lt; 24h</span>
                  <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Avg Response</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Preview Section */}
        <section id="features" className="py-24 bg-card transition-colors">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid items-center gap-16 lg:grid-cols-2">
              <div className="space-y-8 animate-fade-in">
                <div>
                  <h2 className="font-display text-3xl font-bold text-foreground dark:text-white sm:text-4xl">
                    Everything you need for a <span className="text-blue-600">better hostel experience.</span>
                  </h2>
                </div>
                <div className="grid gap-8">
                  {features.map((feature) => (
                    <div key={feature.title} className="flex gap-6 group">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${feature.bg} ${feature.color} shadow-sm transition-transform group-hover:scale-110`}>
                        <feature.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-display text-lg font-bold text-foreground dark:text-white">{feature.title}</h3>
                        <p className="mt-1 text-slate-600 dark:text-slate-400 leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Decorative App Mockup */}
              <div className="relative animate-slide-up">
                <div className="absolute -inset-4 rounded-[2.5rem] bg-blue-100/50 [mask-image:radial-gradient(closest-side,white,transparent)]" />
                <div className="glass relative rounded-3xl p-6 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Task</p>
                      <h4 className="font-display text-lg font-bold text-foreground dark:text-white">Room 402 AC Repair</h4>
                    </div>
                    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">In Progress</Badge>
                  </div>
                  <div className="mt-6 space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 dark:text-slate-400 font-bold">JD</div>
                      <div>
                        <p className="text-sm font-bold text-foreground dark:text-white">John Doe (Student)</p>
                        <p className="text-xs text-slate-500">Submitted 2 hours ago</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <p className="text-sm font-bold text-foreground dark:text-white">Activity Timeline</p>
                      <div className="space-y-4">
                        <TimelineItem label="Ticket Created" time="10:00 AM" status="complete" />
                        <TimelineItem label="Assigned to Electrician" time="10:45 AM" status="complete" />
                        <TimelineItem label="Technical Check in Progress" time="11:30 AM" status="active" />
                        <TimelineItem label="Expected Resolution" time="04:00 PM" status="pending" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 dark:bg-slate-900/80 px-8 py-16 text-center md:px-16 md:py-24 shadow-2xl">
              <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,#1e4ed8_0%,transparent_50%)] opacity-20" />
              <div className="relative z-10 flex flex-col items-center">
                <h2 className="font-display text-4xl font-bold text-white md:text-5xl">Ready to fix your hostel?</h2>
                <p className="mt-6 max-w-xl text-lg text-slate-300">
                  Join hundreds of students who are already using Hostel Sync to make their living space better.
                </p>
                <div className="mt-10 flex flex-wrap justify-center gap-4">
                  <Button asChild size="lg" variant="secondary" className="bg-white text-slate-900 hover:bg-slate-50 rounded-full px-8 h-14 font-extrabold shadow-xl transition-all">
                    <Link href="/auth/register">Create Student Account</Link>
                  </Button>
                  <Button asChild size="lg" variant="ghost" className="text-white hover:bg-white/5 rounded-full px-8 h-14 border border-white/20 transition-all">
                    <Link href="/auth/login?role=admin">Admin Access</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12 transition-colors">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-blue-600 p-1">
                <Image src="/logo.png" alt="Hostel Sync" width={32} height={32} />
              </div>
              <span className="font-display font-bold text-foreground dark:text-white">Hostel Sync</span>
            </div>
            <div className="flex gap-8 text-sm text-slate-500">
              <Link href="#" className="hover:text-blue-600">Privacy Policy</Link>
              <Link href="#" className="hover:text-blue-600">Terms of Service</Link>
              <Link href="#" className="hover:text-blue-600">Contact Support</Link>
            </div>
            <p className="text-sm text-slate-400">
              © 2026 Hostel Sync. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function TimelineItem({ label, time, status }: { label: string; time: string; status: "complete" | "active" | "pending" }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1.5 flex h-4 w-4 shrink-0 items-center justify-center">
        {status === "complete" ? (
          <div className="h-2.5 w-2.5 rounded-full bg-blue-600" />
        ) : status === "active" ? (
          <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-blue-600 ring-4 ring-blue-100" />
        ) : (
          <div className="h-2.5 w-2.5 rounded-full bg-slate-200" />
        )}
      </div>
      <div>
        <p className={`text-sm font-bold ${status === "pending" ? "text-slate-400" : "text-foreground dark:text-white"}`}>{label}</p>
        <p className="text-xs text-slate-500">{time}</p>
      </div>
    </div>
  );
}
