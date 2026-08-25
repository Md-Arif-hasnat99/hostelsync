"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUser, useClerk } from "@clerk/nextjs";
import {
  Search, LogOut, Plus, LayoutDashboard, History,
  Settings, ChevronRight, Sun, Moon, Menu, X
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/components/theme-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  getMyComplaints,
  getMyProfile,
  submitComplaint,
  type Profile,
} from "@/app/actions/complaints";

const formSchema = z.object({
  title: z.string().min(4, "Add a short title"),
  category: z.string().min(3, "Choose a category"),
  description: z.string().min(10, "Describe the issue"),
  priority: z.enum(["normal", "urgent"]),
});

type FormData = z.infer<typeof formSchema>;

type ComplaintRow = {
  id: string;
  title: string;
  category: string;
  status: "pending" | "in_progress" | "resolved";
  priority: "normal" | "urgent";
  date: string;
};

const STATUS_COLOR: Record<string, string> = {
  pending:     "warning",
  in_progress: "info",
  resolved:    "success",
};

export default function StudentDashboardPage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const [complaints, setComplaints] = useState<ComplaintRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ComplaintRow["status"]>("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | ComplaintRow["priority"]>("all");
  const [selected, setSelected] = useState<ComplaintRow | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "history" | "settings">("overview");
  const [signingOut, setSigningOut] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  // Load profile + complaints via server actions
  useEffect(() => {
    if (!isLoaded) return;
    if (!user) { router.push("/sign-in"); return; }

    async function init() {
      const profileData = await getMyProfile();

      if (!profileData) { router.push("/sign-in"); return; }
      if (profileData.role !== "student") { router.push("/dashboard/admin"); return; }
      setProfile(profileData);

      const data = await getMyComplaints();
      const mapped = data.map((d: any) => ({
        id: d.id,
        title: d.title,
        category: d.category,
        status: d.status,
        priority: d.priority,
        date: new Date(d.created_at).toLocaleDateString(undefined, {
          month: "short", day: "numeric", year: "numeric",
        }),
      }));
      setComplaints(mapped);
      setLoading(false);

      // Realtime subscription (anon client — notification only, no data read)
      const channel = supabase
        .channel(`complaints-student-${user!.id}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "complaints", filter: `student_id=eq.${user!.id}` },
          async () => {
            const fresh = await getMyComplaints();
            const updated = fresh.map((d: any) => ({
              id: d.id,
              title: d.title,
              category: d.category,
              status: d.status,
              priority: d.priority,
              date: new Date(d.created_at).toLocaleDateString(undefined, {
                month: "short", day: "numeric", year: "numeric",
              }),
            }));
            setComplaints(updated);
          }
        )
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }

    const cleanup = init();
    return () => { cleanup.then(fn => fn?.()); };
  }, [isLoaded, user, router]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { priority: "normal" },
  });

  const onSubmit = async (values: FormData) => {
    setSubmitting(true);
    setError(null);

    try {
      const record = await submitComplaint(values);
      const createdAt = record?.created_at ? new Date(record.created_at) : null;
      setComplaints((prev) => [
        {
          id: record?.id ?? "NEW",
          title: values.title,
          category: values.category,
          priority: values.priority,
          status: "pending",
          date: createdAt
            ? createdAt.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
            : "Just now",
        },
        ...prev,
      ]);
      reset({ title: "", category: "", description: "", priority: "normal" });
      setShowForm(false);
    } catch (err: any) {
      setError(err.message ?? "Could not submit complaint");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut({ redirectUrl: "/sign-in" });
  };

  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const matchesSearch = `${c.title} ${c.category} ${c.id}`.toLowerCase().includes(search.trim().toLowerCase());
      const matchesStatus = statusFilter === "all" || c.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || c.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [complaints, search, statusFilter, priorityFilter]);

  const userName = profile?.full_name || user?.firstName || "Student";
  const hostelInfo = profile?.hostel
    ? `${profile.hostel}${profile.room ? `, Rm ${profile.room}` : ""}`
    : "Hostel Resident";

  return (
    <div className="flex min-h-screen w-full bg-background transition-colors duration-300">

      {/* Mobile overlay */}
      {showMobileMenu && (
        <div
          className="fixed inset-0 z-40 bg-[#1C1917]/30 lg:hidden"
          onClick={() => setShowMobileMenu(false)}
        />
      )}

      {/* ── Sidebar ──────────────────────────────────────── */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-56 border-r border-border bg-card flex flex-col transition-transform lg:static lg:block lg:translate-x-0
        ${showMobileMenu ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
          <Logo size={22} showText={false} />
          <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-foreground">
            Hostel<span className="text-[#8B2326]">Sync</span>
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <NavItem icon={LayoutDashboard} label="Overview" active={activeTab === 'overview'} onClick={() => { setActiveTab('overview'); setShowMobileMenu(false); }} />
          <NavItem icon={Plus} label="New Complaint" onClick={() => { setShowForm(true); setShowMobileMenu(false); }} />
          <NavItem icon={History} label="History" active={activeTab === 'history'} onClick={() => { setActiveTab('history'); setShowMobileMenu(false); }} />
          <NavItem icon={Settings} label="Settings" active={activeTab === 'settings'} onClick={() => { setActiveTab('settings'); setShowMobileMenu(false); }} />
        </nav>

        {/* User info at bottom */}
        <div className="border-t border-border px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted truncate">{hostelInfo}</p>
          <p className="text-[12px] font-medium text-foreground mt-0.5 truncate">{userName}</p>
        </div>
      </aside>

      {/* ── Main area ──────────────────────────────────── */}
      <div className="flex flex-1 flex-col min-w-0">

        {/* Top header */}
        <header className="flex h-12 items-center justify-between border-b border-border bg-card px-5 lg:px-8 shrink-0">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-1.5 text-muted hover:text-foreground"
            >
              {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <div className="relative max-w-xs w-full hidden md:block">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search complaints…"
                className="w-full border border-border bg-background py-1.5 pl-8 pr-3 text-[13px] outline-none focus:border-[#1C1917] focus:ring-1 focus:ring-[#1C1917]/10 transition-all text-foreground placeholder:text-muted"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-1.5 text-muted hover:text-foreground transition-colors"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
            <div className="h-5 w-px bg-border" />
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="flex items-center gap-1.5 px-2 py-1 text-[12px] font-medium text-muted hover:text-[#8B2326] transition-colors"
              title="Log out"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-5 lg:p-8 animate-fade-in">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 border-2 border-border border-t-[#1C1917] rounded-full animate-spin" />
                <p className="font-mono text-[11px] uppercase tracking-widest text-muted">Loading register…</p>
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-5xl">

              {/* ── Overview Tab ── */}
              {activeTab === 'overview' && (
                <div className="flex flex-col gap-6">

                  <div className="flex items-end justify-between border-b border-border pb-4">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#8B2326] mb-1">Complaint Register</p>
                      <h1 className="font-display text-2xl font-bold text-foreground">Overview</h1>
                    </div>
                    <Button onClick={() => setShowForm(true)} size="sm" variant="primary">
                      <Plus className="mr-1.5 h-3.5 w-3.5" /> New Entry
                    </Button>
                  </div>

                  {/* Stats tally */}
                  <div className="grid grid-cols-3 border border-border divide-x divide-border">
                    <TallyBox label="Pending" count={complaints.filter(c => c.status === "pending").length} accent="ochre" />
                    <TallyBox label="In Progress" count={complaints.filter(c => c.status === "in_progress").length} accent="ink" />
                    <TallyBox label="Resolved" count={complaints.filter(c => c.status === "resolved").length} accent="green" />
                  </div>

                  {/* Filter bar */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center border-b border-border pb-4">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted shrink-0">Filter:</span>
                    <div className="flex flex-wrap gap-2">
                      <select
                        className="border border-border bg-background px-3 py-1.5 text-[12px] font-mono text-foreground outline-none focus:border-[#1C1917] rounded-[2px]"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                      >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                      <select
                        className="border border-border bg-background px-3 py-1.5 text-[12px] font-mono text-foreground outline-none focus:border-[#1C1917] rounded-[2px]"
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value as any)}
                      >
                        <option value="all">All Priority</option>
                        <option value="normal">Normal</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  {/* Ledger list */}
                  <div className="border border-border">
                    <div className="grid grid-cols-[4rem_1fr_auto_auto] gap-4 px-4 py-2 border-b border-border bg-background">
                      <span className="font-mono text-[9px] uppercase tracking-widest text-muted">Ref No.</span>
                      <span className="font-mono text-[9px] uppercase tracking-widest text-muted">Issue / Category</span>
                      <span className="font-mono text-[9px] uppercase tracking-widest text-muted hidden sm:block">Priority</span>
                      <span className="font-mono text-[9px] uppercase tracking-widest text-muted">Status</span>
                    </div>

                    {filteredComplaints.slice(0, 5).map((item, i) => (
                      <LedgerRow
                        key={item.id}
                        item={item}
                        onClick={() => setSelected(item)}
                        isLast={i === Math.min(filteredComplaints.length, 5) - 1}
                      />
                    ))}

                    {filteredComplaints.length === 0 && (
                      <div className="py-14 text-center">
                        <p className="font-mono text-[11px] uppercase tracking-widest text-muted">No entries match current filters</p>
                        <button
                          onClick={() => { setSearch(""); setStatusFilter("all"); setPriorityFilter("all"); }}
                          className="mt-3 font-mono text-[11px] underline underline-offset-2 text-muted hover:text-foreground"
                        >
                          Clear filters
                        </button>
                      </div>
                    )}

                    {filteredComplaints.length > 5 && (
                      <div className="border-t border-border px-4 py-3">
                        <button
                          onClick={() => setActiveTab('history')}
                          className="font-mono text-[11px] text-muted hover:text-foreground underline underline-offset-2 transition-colors"
                        >
                          View full history ({filteredComplaints.length} entries) →
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── History Tab ── */}
              {activeTab === 'history' && (
                <div className="flex flex-col gap-6">
                  <div className="border-b border-border pb-4">
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#8B2326] mb-1">Full Record</p>
                    <h1 className="font-display text-2xl font-bold text-foreground">Complaint History</h1>
                    <p className="mt-1 text-[13px] text-muted">All filed complaints, most recent first</p>
                  </div>

                  <div className="border border-border">
                    <div className="grid grid-cols-[4rem_1fr_auto_auto] gap-4 px-4 py-2 border-b border-border bg-background">
                      <span className="font-mono text-[9px] uppercase tracking-widest text-muted">Ref No.</span>
                      <span className="font-mono text-[9px] uppercase tracking-widest text-muted">Issue / Category</span>
                      <span className="font-mono text-[9px] uppercase tracking-widest text-muted hidden sm:block">Priority</span>
                      <span className="font-mono text-[9px] uppercase tracking-widest text-muted">Status</span>
                    </div>

                    {complaints.length > 0 ? (
                      complaints.map((item, i) => (
                        <LedgerRow
                          key={item.id}
                          item={item}
                          onClick={() => setSelected(item)}
                          isLast={i === complaints.length - 1}
                        />
                      ))
                    ) : (
                      <div className="py-14 text-center">
                        <p className="font-mono text-[11px] uppercase tracking-widest text-muted">No complaints on record</p>
                        <button
                          onClick={() => setShowForm(true)}
                          className="mt-3 font-mono text-[11px] underline underline-offset-2 text-muted hover:text-foreground"
                        >
                          File first complaint →
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── Settings Tab ── */}
              {activeTab === 'settings' && (
                <div className="flex flex-col gap-6 max-w-lg">
                  <div className="border-b border-border pb-4">
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#8B2326] mb-1">Account</p>
                    <h1 className="font-display text-2xl font-bold text-foreground">Settings</h1>
                  </div>

                  <Card>
                    <CardHeader>
                      <h3 className="font-bold text-[14px] text-foreground">Profile Information</h3>
                      <p className="text-[12px] text-muted">Your registration details</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <p className="font-mono text-[9px] uppercase tracking-widest text-muted mb-1">Email</p>
                          <p className="text-[13px] font-medium text-foreground">
                            {user?.primaryEmailAddress?.emailAddress}
                          </p>
                        </div>
                        <div>
                          <p className="font-mono text-[9px] uppercase tracking-widest text-muted mb-1">Account Type</p>
                          <Badge color="neutral">Student</Badge>
                        </div>
                        <div>
                          <p className="font-mono text-[9px] uppercase tracking-widest text-muted mb-1">Hostel / Room</p>
                          <p className="font-mono text-[12px] text-foreground">{hostelInfo}</p>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-border">
                        <p className="font-mono text-[11px] text-muted">
                          To update your password, visit your account settings via the user menu.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

            </div>
          )}
        </main>
      </div>

      {/* ── New complaint modal ─────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1917]/40 p-4">
          <Card className="w-full max-w-xl bg-card animate-slide-up">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[#8B2326] mb-1">New Entry</p>
                  <h2 className="font-bold text-[15px] text-foreground">File Complaint</h2>
                  <p className="text-[12px] text-muted mt-0.5">Describe the issue. It will be logged immediately.</p>
                </div>
                <button onClick={() => setShowForm(false)} className="text-muted hover:text-foreground p-1">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
                <div className="md:col-span-2 space-y-1">
                  <Input label="Short Title" placeholder="e.g. No hot water in Block C bathrooms" {...register("title")} aria-invalid={!!errors.title} />
                  {errors.title && <p className="font-mono text-[11px] text-[#8B2326]">{errors.title.message}</p>}
                </div>

                <div className="space-y-1">
                  <Select label="Category" {...register("category")} aria-invalid={!!errors.category}>
                    <option value="">Select category…</option>
                    <option value="Water Supply">Water Supply</option>
                    <option value="Electricity">Electricity</option>
                    <option value="Internet/WiFi">Internet / WiFi</option>
                    <option value="Food Quality">Food Quality</option>
                    <option value="Cleanliness">Cleanliness</option>
                    <option value="Maintenance">Maintenance</option>
                  </Select>
                  {errors.category && <p className="font-mono text-[11px] text-[#8B2326]">{errors.category.message}</p>}
                </div>

                <div className="space-y-1">
                  <Select label="Priority" {...register("priority")}>
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent</option>
                  </Select>
                </div>

                <div className="md:col-span-2 space-y-1">
                  <Textarea
                    label="Description"
                    placeholder="Describe the issue in detail — block, floor, room number if relevant…"
                    rows={3}
                    {...register("description")}
                    aria-invalid={!!errors.description}
                  />
                  {errors.description && <p className="font-mono text-[11px] text-[#8B2326]">{errors.description.message}</p>}
                </div>

                {error && <p className="md:col-span-2 font-mono text-[11px] text-[#8B2326]">{error}</p>}

                <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2 border-t border-border">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)} disabled={submitting}>Cancel</Button>
                  <Button type="submit" size="sm" disabled={submitting}>
                    {submitting ? "Submitting…" : "Submit Complaint"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Complaint detail modal ─────────────────────── */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1917]/40 p-4">
          <Card className="w-full max-w-sm bg-card animate-slide-up">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-2 flex-wrap">
                  <Badge color={selected.status === 'resolved' ? 'success' : selected.status === 'in_progress' ? 'info' : 'warning'}>
                    {selected.status.replace('_', ' ')}
                  </Badge>
                  <Badge color={selected.priority === 'urgent' ? 'danger' : 'neutral'}>{selected.priority}</Badge>
                </div>
                <button onClick={() => setSelected(null)} className="text-muted hover:text-foreground shrink-0 p-0.5">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <h3 className="font-bold text-[15px] text-foreground mt-2">{selected.title}</h3>
              <p className="font-mono text-[10px] text-muted mt-0.5">{selected.id} · {selected.category} · {selected.date}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-muted mb-3">Status Progression</p>
                  <div className="space-y-0">
                    <TimelineStep label="Complaint Filed" sub={selected.date} state="done" />
                    <TimelineStep
                      label="Under Review"
                      sub={selected.status === 'pending' ? 'Awaiting assignment' : 'Reviewed'}
                      state={selected.status === 'pending' ? 'active' : 'done'}
                    />
                    <TimelineStep
                      label="Work In Progress"
                      sub={selected.status === 'in_progress' ? 'Currently active' : selected.status === 'resolved' ? 'Completed' : 'Not started'}
                      state={selected.status === 'resolved' ? 'done' : selected.status === 'in_progress' ? 'active' : 'idle'}
                    />
                    <TimelineStep
                      label="Closed"
                      sub={selected.status === 'resolved' ? 'Issue resolved' : 'Pending'}
                      state={selected.status === 'resolved' ? 'done' : 'idle'}
                      isLast
                    />
                  </div>
                </div>
                <Button variant="secondary" size="sm" className="w-full" onClick={() => setSelected(null)}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────── */

function NavItem({ icon: Icon, label, active, onClick }: {
  icon: any; label: string; active?: boolean; onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 px-3 py-2 text-[13px] font-medium transition-all border-l-2 ${
        active
          ? 'border-l-[#8B2326] text-foreground bg-[#F2E4E4]/60 dark:bg-[#8B2326]/10 font-bold'
          : 'border-l-transparent text-muted hover:text-foreground hover:bg-[#EDE8DF]/50 dark:hover:bg-[#3A2F28]/50'
      }`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      {label}
    </button>
  );
}

function LedgerRow({ item, onClick, isLast }: { item: ComplaintRow; onClick: () => void; isLast: boolean }) {
  const isUrgent = item.priority === "urgent";
  return (
    <div
      className={`grid grid-cols-[4rem_1fr_auto_auto] items-center gap-4 px-4 py-3 cursor-pointer transition-colors hover:bg-[#EDE8DF]/50 dark:hover:bg-[#3A2F28]/30 ${
        isLast ? "" : "border-b border-border"
      } border-l-[3px] ${isUrgent ? "border-l-[#8B2326]" : "border-l-transparent"}`}
      onClick={onClick}
    >
      <div>
        <p className="font-mono text-[10px] font-bold text-muted">{item.id.toString().slice(0, 8)}</p>
        <p className="font-mono text-[9px] text-muted/60 mt-0.5">{item.date}</p>
      </div>
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-foreground truncate">{item.title}</p>
        <p className="font-mono text-[9px] uppercase tracking-wider text-muted mt-0.5">{item.category}</p>
      </div>
      <div className="hidden sm:block">
        {isUrgent && <Badge color="danger">Urgent</Badge>}
      </div>
      <div className="flex items-center gap-2">
        <Badge color={item.status === 'resolved' ? 'success' : item.status === 'in_progress' ? 'info' : 'warning'}>
          {item.status === 'in_progress' ? 'In Prog.' : item.status}
        </Badge>
        <ChevronRight className="h-3.5 w-3.5 text-muted" />
      </div>
    </div>
  );
}

function TallyBox({ label, count, accent }: { label: string; count: number; accent: 'ochre' | 'ink' | 'green' }) {
  const textColor = accent === 'ochre' ? 'text-[#92400E]' : accent === 'green' ? 'text-[#14532D]' : 'text-foreground';
  return (
    <div className="px-5 py-4">
      <p className={`font-mono text-3xl font-bold ${textColor}`}>{count}</p>
      <p className="font-mono text-[9px] uppercase tracking-widest text-muted mt-1">{label}</p>
    </div>
  );
}

function TimelineStep({
  label, sub, state, isLast
}: {
  label: string; sub: string; state: "done" | "active" | "idle"; isLast?: boolean;
}) {
  const markerColor = state === 'done'
    ? 'text-[#14532D]'
    : state === 'active'
    ? 'text-[#8B2326]'
    : 'text-muted';

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <span className={`font-mono text-[14px] leading-none select-none ${markerColor}`}>
          {state === 'done' ? '◆' : state === 'active' ? '◇' : '·'}
        </span>
        {!isLast && <div className="w-px flex-1 min-h-[18px] bg-border mt-0.5" />}
      </div>
      <div className="pb-3">
        <p className={`text-[13px] font-medium ${state === 'idle' ? 'text-muted' : 'text-foreground'}`}>{label}</p>
        <p className="font-mono text-[10px] text-muted">{sub}</p>
      </div>
    </div>
  );
}
