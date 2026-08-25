"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Bar } from "react-chartjs-2";
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
  BarElement,
} from "chart.js";
import { supabase } from "@/lib/supabase";
import {
  Search, LogOut, LayoutDashboard, Settings, Download, RefreshCcw,
  TrendingUp, Users, AlertCircle, History, Plus, Sun, Moon, Menu, X, Zap
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

type ComplaintRow = {
  id: string;
  title: string;
  category: string;
  status: "pending" | "in_progress" | "resolved";
  priority: "normal" | "urgent";
  student_id: string | null;
  created_at: string | null;
};

// Chart: graphite palette — no blue
const chartData = {
  labels: ["Water", "Electricity", "Internet", "Food", "Cleanliness", "Maintenance"],
  datasets: [
    {
      label: "Complaints",
      data: [5, 3, 4, 2, 6, 4],
      backgroundColor: "rgba(28, 25, 23, 0.12)",
      borderColor: "rgba(28, 25, 23, 0.7)",
      borderWidth: 1.5,
    },
  ],
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { display: false }, ticks: { font: { family: "monospace", size: 10 }, color: "#78716C" } },
    y: {
      grid: { color: "rgba(214,207,196,0.5)" },
      ticks: { precision: 0, font: { family: "monospace", size: 10 }, color: "#78716C" }
    }
  }
};

export default function AdminDashboardPage() {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"all" | ComplaintRow["status"]>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [realtimeStatus, setRealtimeStatus] = useState<"connecting" | "active" | "error">("connecting");
  const [activeTab, setActiveTab] = useState<"operations" | "students" | "logs" | "governance">("operations");
  const [categories, setCategories] = useState(["Water Supply", "Electricity", "Internet/WiFi", "Food Quality", "Cleanliness", "Maintenance"]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [showManageRoles, setShowManageRoles] = useState(false);
  const [admins, setAdmins] = useState([
    { name: "R. Krishnamurthy", role: "Chief Warden", email: "warden@hostelsync.edu" },
    { name: "K. Desai", role: "Hostel Manager", email: "manager@hostelsync.edu" },
  ]);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Auth check
  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "admin") {
        router.push("/dashboard/student");
      }
    }
    checkAuth();
  }, [router]);

  // Real-time sync
  useEffect(() => {
    const channel = supabase
      .channel("complaints-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "complaints" },
        async (payload) => {
          await queryClient.invalidateQueries({ queryKey: ["complaints"] });
          if (payload.eventType === "INSERT") {
            setStatusMessage("New complaint received.");
            setTimeout(() => setStatusMessage(null), 5000);
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") setRealtimeStatus("active");
        if (status === "CHANNEL_ERROR") setRealtimeStatus("error");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const fetchComplaints = async () => {
    const { data, error } = await supabase
      .from("complaints")
      .select("id,title,category,status,priority,created_at,student_id")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  };

  const {
    data: complaints = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery<ComplaintRow[]>({
    queryKey: ["complaints"],
    queryFn: fetchComplaints,
    staleTime: 10_000,
    refetchOnWindowFocus: true
  });

  const summary = useMemo(() => {
    const total = complaints.length;
    const pending = complaints.filter((c) => c.status === "pending").length;
    const inProgress = complaints.filter((c) => c.status === "in_progress").length;
    const resolved = complaints.filter((c) => c.status === "resolved").length;
    return [
      { label: "Total Logged", value: total,      accent: "ink" as const },
      { label: "Pending",      value: pending,     accent: "ochre" as const },
      { label: "In Progress",  value: inProgress,  accent: "ink" as const },
      { label: "Resolved",     value: resolved,    accent: "green" as const },
    ];
  }, [complaints]);

  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const matchesStatus = filterStatus === "all" ? true : c.status === filterStatus;
      const term = searchTerm.trim().toLowerCase();
      const matchesTerm = term
        ? c.title.toLowerCase().includes(term) || c.category.toLowerCase().includes(term)
        : true;
      return matchesStatus && matchesTerm;
    });
  }, [complaints, filterStatus, searchTerm]);

  const handleSignOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const handleExport = async () => {
    if (!complaints.length) return;
    const header = ["id", "title", "category", "status", "priority", "created_at"];
    const rows = complaints.map((c) => [c.id, c.title, c.category, c.status, c.priority, c.created_at ?? ""]);
    const csv = [header, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `complaints_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    setStatusMessage("Data exported successfully");
  };

  const handleUpdateStatus = async () => {
    setUpdating(true);
    const { error: updateError } = await supabase.from("complaints").update({ status: "in_progress" }).eq("status", "pending");
    if (!updateError) setStatusMessage("Pending complaints moved to In Progress");
    await queryClient.invalidateQueries({ queryKey: ["complaints"] });
    setUpdating(false);
  };

  const handleStatusUpdate = async (id: string, status: ComplaintRow["status"]) => {
    setUpdating(true);
    setStatusMessage(null);
    const { error: updateError } = await supabase.from("complaints").update({ status }).eq("id", id);
    if (updateError) {
      setStatusMessage(updateError.message);
      setUpdating(false);
      return;
    }
    setStatusMessage(`Complaint ${id.slice(0, 8)} → ${status.replace("_", " ")}`);
    await queryClient.invalidateQueries({ queryKey: ["complaints"] });
    await refetch();
    setUpdating(false);
  };

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
        <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
          <Logo size={22} showText={false} />
          <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-foreground">
            Hostel<span className="text-[#8B2326]">Sync</span>
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          <NavItem icon={LayoutDashboard} label="Operations" active={activeTab === 'operations'} onClick={() => { setActiveTab('operations'); setShowMobileMenu(false); }} />
          <NavItem icon={Users} label="Residents" active={activeTab === 'students'} onClick={() => { setActiveTab('students'); setShowMobileMenu(false); }} />
          <NavItem icon={History} label="Audit Log" active={activeTab === 'logs'} onClick={() => { setActiveTab('logs'); setShowMobileMenu(false); }} />
          <NavItem icon={Settings} label="Governance" active={activeTab === 'governance'} onClick={() => { setActiveTab('governance'); setShowMobileMenu(false); }} />
        </nav>

        <div className="border-t border-border px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted">Admin Portal</p>
          <p className="text-[12px] font-medium text-foreground mt-0.5">Warden Access</p>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col min-w-0">

        {/* Header */}
        <header className="flex h-12 items-center justify-between border-b border-border bg-card px-5 lg:px-8 shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="lg:hidden p-1.5 text-muted hover:text-foreground">
              {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <div className="relative max-w-xs w-full hidden md:block">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search register…"
                className="w-full border border-border bg-background py-1.5 pl-8 pr-3 text-[13px] outline-none focus:border-[#1C1917] focus:ring-1 focus:ring-[#1C1917]/10 transition-all text-foreground placeholder:text-muted"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className={`p-1.5 text-muted hover:text-foreground transition-all ${isFetching ? 'animate-spin' : ''}`}
              title="Refresh"
            >
              <RefreshCcw className="h-4 w-4" />
            </button>
            {/* Realtime indicator */}
            <div className="flex items-center gap-1.5 px-2">
              <div className={`h-1.5 w-1.5 rounded-full ${
                realtimeStatus === 'active' ? 'bg-[#14532D]' :
                realtimeStatus === 'connecting' ? 'bg-[#92400E]' : 'bg-[#8B2326]'
              }`} />
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted hidden sm:inline">
                {realtimeStatus === 'active' ? 'Live' : realtimeStatus === 'connecting' ? 'Sync…' : 'Offline'}
              </span>
            </div>
            <div className="h-5 w-px bg-border" />
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

        <main className="flex-1 overflow-y-auto p-5 lg:p-8 animate-fade-in">
          <div className="mx-auto max-w-7xl flex flex-col gap-7">

            {/* ── Operations Tab ── */}
            {activeTab === 'operations' && (
              <>
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-4">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#8B2326] mb-1">Admin Register</p>
                    <h1 className="font-display text-2xl font-bold text-foreground">Operations</h1>
                    <p className="mt-0.5 text-[13px] text-muted">Live complaint management</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleExport}>
                      <Download className="mr-1.5 h-3.5 w-3.5" /> Export CSV
                    </Button>
                    <Button size="sm" onClick={handleUpdateStatus} disabled={updating}>
                      <Zap className="mr-1.5 h-3.5 w-3.5" /> Triage Pending
                    </Button>
                  </div>
                </div>

                {/* Tally row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 border border-border divide-x divide-y lg:divide-y-0 divide-border">
                  {summary.map(item => (
                    <div key={item.label} className="px-5 py-4">
                      <p className={`font-mono text-3xl font-bold ${
                        item.accent === 'ochre' ? 'text-[#92400E]' :
                        item.accent === 'green' ? 'text-[#14532D]' : 'text-foreground'
                      }`}>{item.value}</p>
                      <p className="font-mono text-[9px] uppercase tracking-widest text-muted mt-1">{item.label}</p>
                    </div>
                  ))}
                </div>

                {/* Main content grid */}
                <div className="grid gap-6 lg:grid-cols-3">

                  {/* Complaint table — 2/3 */}
                  <div className="lg:col-span-2 flex flex-col gap-3">
                    {/* Filter bar */}
                    <div className="flex items-center justify-between border border-border bg-card px-4 py-3">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-muted">Status Filter:</span>
                      <select
                        className="border border-border bg-background px-3 py-1.5 text-[12px] font-mono text-foreground outline-none focus:border-[#1C1917] rounded-[2px]"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as any)}
                      >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>

                    {/* Register table */}
                    <div className="border border-border overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                          <thead className="border-b border-border bg-background">
                            <tr>
                              <th className="px-4 py-3 font-mono text-[9px] uppercase tracking-widest text-muted">Ref / Issue</th>
                              <th className="px-4 py-3 font-mono text-[9px] uppercase tracking-widest text-muted">Received</th>
                              <th className="px-4 py-3 font-mono text-[9px] uppercase tracking-widest text-muted hidden md:table-cell">Resident</th>
                              <th className="px-4 py-3 font-mono text-[9px] uppercase tracking-widest text-muted">Status</th>
                              <th className="px-4 py-3 font-mono text-[9px] uppercase tracking-widest text-muted text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredComplaints.length > 0 ? (
                              filteredComplaints.map((c, i) => (
                                <tr
                                  key={c.id}
                                  className={`border-b border-border hover:bg-[#EDE8DF]/50 dark:hover:bg-[#3A2F28]/30 transition-colors ${
                                    c.priority === 'urgent' ? 'border-l-2 border-l-[#8B2326]' : ''
                                  }`}
                                >
                                  <td className="px-4 py-3">
                                    <p className="font-mono text-[10px] font-bold text-muted mb-0.5">{c.id.toString().slice(0, 8)}</p>
                                    <p className="text-[13px] font-medium text-foreground">{c.title}</p>
                                    <p className="font-mono text-[9px] uppercase tracking-wider text-muted">{c.category}</p>
                                  </td>
                                  <td className="px-4 py-3">
                                    <p className="font-mono text-[11px] font-medium text-foreground">
                                      {c.created_at ? new Date(c.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : 'N/A'}
                                    </p>
                                    <p className="font-mono text-[10px] text-muted">
                                      {c.created_at ? new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                    </p>
                                  </td>
                                  <td className="px-4 py-3 hidden md:table-cell">
                                    <p className="font-mono text-[10px] text-muted">
                                      {c.student_id ? `…${c.student_id.slice(-6)}` : 'Unknown'}
                                    </p>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                      <div className={`h-1.5 w-1.5 rounded-full ${
                                        c.status === 'resolved' ? 'bg-[#14532D]' :
                                        c.status === 'in_progress' ? 'bg-[#1C1917]' : 'bg-[#92400E]'
                                      }`} />
                                      <span className="font-mono text-[11px] font-medium text-foreground capitalize">
                                        {c.status.replace('_', ' ')}
                                      </span>
                                      {c.priority === 'urgent' && <Badge color="danger">Urgent</Badge>}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <select
                                      className="border border-border bg-background px-2 py-1 font-mono text-[11px] text-foreground outline-none focus:border-[#1C1917] rounded-[2px]"
                                      value={c.status}
                                      onChange={(e) => handleStatusUpdate(c.id, e.target.value as any)}
                                    >
                                      <option value="pending">Pending</option>
                                      <option value="in_progress">In Progress</option>
                                      <option value="resolved">Resolved</option>
                                    </select>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={5} className="px-4 py-16 text-center">
                                  <p className="font-mono text-[11px] uppercase tracking-widest text-muted">
                                    {isLoading ? "Loading register…" : "No complaints match current filters"}
                                  </p>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Right column — Analytics & status */}
                  <div className="flex flex-col gap-5">
                    {/* Category chart */}
                    <Card>
                      <CardHeader>
                        <p className="font-mono text-[9px] uppercase tracking-widest text-muted">Category Mix</p>
                        <h3 className="font-display text-[14px] font-bold text-foreground">Complaints by Type</h3>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[200px] w-full">
                          <Bar data={chartData} options={chartOptions} />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Sync status panel */}
                    <Card>
                      <CardHeader>
                        <p className="font-mono text-[9px] uppercase tracking-widest text-muted">System</p>
                        <h3 className="font-display text-[14px] font-bold text-foreground">Operational Status</h3>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between border border-border px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className={`h-1.5 w-1.5 rounded-full ${
                              realtimeStatus === 'active' ? 'bg-[#14532D]' :
                              realtimeStatus === 'connecting' ? 'bg-[#92400E]' : 'bg-[#8B2326]'
                            }`} />
                            <span className="text-[13px] font-medium text-foreground">
                              {realtimeStatus === 'active' ? 'Live Sync Active' : realtimeStatus === 'connecting' ? 'Connecting…' : 'Sync Error'}
                            </span>
                          </div>
                          <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
                            {realtimeStatus === 'active' ? 'Online' : realtimeStatus === 'connecting' ? 'Wait' : 'Offline'}
                          </span>
                        </div>
                        <p className="text-[12px] text-muted leading-relaxed">
                          New complaints appear in real-time. Use the refresh button to force-fetch if needed.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </>
            )}

            {/* ── Residents Tab ── */}
            {activeTab === 'students' && (
              <div className="flex flex-col gap-6">
                <div className="border-b border-border pb-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#8B2326] mb-1">Directory</p>
                  <h1 className="font-display text-2xl font-bold text-foreground">Resident Directory</h1>
                  <p className="mt-0.5 text-[13px] text-muted">Registered hostel residents</p>
                </div>
                <div className="border border-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead className="border-b border-border bg-background">
                        <tr>
                          <th className="px-4 py-3 font-mono text-[9px] uppercase tracking-widest text-muted">Name</th>
                          <th className="px-4 py-3 font-mono text-[9px] uppercase tracking-widest text-muted">Room</th>
                          <th className="px-4 py-3 font-mono text-[9px] uppercase tracking-widest text-muted">Status</th>
                          <th className="px-4 py-3 font-mono text-[9px] uppercase tracking-widest text-muted text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { name: "Priya Krishnaswamy", room: "Block A — 302", active: true },
                          { name: "Rahul Nair",         room: "Block B — 105", active: true },
                          { name: "Tanvir Ahmed",       room: "Block C — 420", active: false },
                        ].map((s, i) => (
                          <tr key={i} className="border-b border-border hover:bg-[#EDE8DF]/50 dark:hover:bg-[#3A2F28]/30">
                            <td className="px-4 py-3 font-medium text-[13px] text-foreground">{s.name}</td>
                            <td className="px-4 py-3 font-mono text-[12px] text-muted">{s.room}</td>
                            <td className="px-4 py-3">
                              <Badge color={s.active ? "success" : "neutral"}>{s.active ? "Active" : "Inactive"}</Badge>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Button variant="ghost" size="sm">Edit</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── Audit Log Tab ── */}
            {activeTab === 'logs' && (
              <div className="flex flex-col gap-6">
                <div className="border-b border-border pb-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#8B2326] mb-1">Audit</p>
                  <h1 className="font-display text-2xl font-bold text-foreground">Audit Log</h1>
                  <p className="mt-0.5 text-[13px] text-muted">Record of administrative actions</p>
                </div>
                <div className="border border-border">
                  {[
                    { action: "Status Update", detail: "Complaint #HC-2844 → In Progress", user: "K. Desai", time: "2 mins ago" },
                    { action: "Export",        detail: "Monthly register downloaded as CSV", user: "R. Krishnamurthy", time: "1 hour ago" },
                    { action: "Login",         detail: "Admin portal accessed", user: "R. Krishnamurthy", time: "3 hours ago" },
                  ].map((log, i) => (
                    <div key={i} className={`flex items-center justify-between px-5 py-4 ${i < 2 ? 'border-b border-border' : ''}`}>
                      <div>
                        <p className="text-[13px] font-bold text-foreground">{log.action}</p>
                        <p className="text-[12px] text-muted mt-0.5">{log.detail}</p>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <p className="font-mono text-[11px] font-medium text-foreground">{log.user}</p>
                        <p className="font-mono text-[10px] text-muted">{log.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Governance Tab ── */}
            {activeTab === 'governance' && (
              <div className="flex flex-col gap-6">
                <div className="border-b border-border pb-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#8B2326] mb-1">Configuration</p>
                  <h1 className="font-display text-2xl font-bold text-foreground">Governance</h1>
                  <p className="mt-0.5 text-[13px] text-muted">Configure categories and access control</p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <h3 className="font-bold text-[14px] text-foreground">Complaint Categories</h3>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {categories.map(c => (
                          <Badge key={c} color="neutral" className="px-2 py-1 text-[10px]">{c}</Badge>
                        ))}
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setShowAddCategory(true)}>
                        <Plus className="h-3 w-3 mr-1" /> Add Category
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <h3 className="font-bold text-[14px] text-foreground">Access Control</h3>
                      <p className="text-[12px] text-muted">Manage admin roles and permissions</p>
                    </CardHeader>
                    <CardContent>
                      <Button variant="secondary" size="sm" className="w-full" onClick={() => setShowManageRoles(true)}>
                        Manage Roles
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Add Category Modal */}
                {showAddCategory && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1917]/40 p-4">
                    <Card className="w-full max-w-sm bg-card animate-slide-up">
                      <CardHeader>
                        <h3 className="font-bold text-[14px] text-foreground">New Category</h3>
                        <p className="text-[12px] text-muted">Add a complaint category to the system</p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <label className="font-mono text-[10px] uppercase tracking-widest text-muted block mb-1.5">Category Name</label>
                          <input
                            type="text"
                            className="w-full border border-border bg-background px-3 py-2 text-[13px] outline-none focus:border-[#1C1917] focus:ring-1 focus:ring-[#1C1917]/10 text-foreground placeholder:text-muted rounded-[2px]"
                            placeholder="e.g. Plumbing, Furniture"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                          />
                        </div>
                        <div className="flex justify-end gap-3">
                          <Button variant="ghost" size="sm" onClick={() => setShowAddCategory(false)}>Cancel</Button>
                          <Button size="sm" onClick={() => {
                            if (newCategory.trim()) {
                              setCategories([...categories, newCategory.trim()]);
                              setNewCategory("");
                              setShowAddCategory(false);
                              setStatusMessage(`Category added: ${newCategory}`);
                            }
                          }}>
                            Save
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Manage Roles Modal */}
                {showManageRoles && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C1917]/40 p-4">
                    <Card className="w-full max-w-lg bg-card animate-slide-up">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-bold text-[14px] text-foreground">Administrator Roles</h3>
                            <p className="text-[12px] text-muted">Staff with system access</p>
                          </div>
                          <button onClick={() => setShowManageRoles(false)} className="text-muted hover:text-foreground p-1">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {admins.map((admin, idx) => (
                            <div key={idx} className="flex items-center justify-between border border-border px-4 py-3">
                              <div>
                                <p className="text-[13px] font-bold text-foreground">{admin.name}</p>
                                <p className="font-mono text-[10px] text-muted">{admin.email}</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <Badge color={admin.role === 'Chief Warden' ? 'danger' : 'neutral'}>{admin.role}</Badge>
                                <Button variant="ghost" size="sm">Edit</Button>
                              </div>
                            </div>
                          ))}
                          <button
                            className="w-full border border-dashed border-border px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-muted hover:text-foreground hover:border-foreground transition-colors"
                            onClick={() => setStatusMessage("Admin registration is restricted. Contact system admin.")}
                          >
                            + Invite Administrator
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            )}

          </div>
        </main>
      </div>

      {/* ── Status notification strip ─────────────────── */}
      {statusMessage && (
        <div className="fixed bottom-0 inset-x-0 z-50 border-t border-border bg-[#1C1917] animate-slide-up">
          <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between">
            <p className="font-mono text-[12px] text-[#EDE8DF]">{statusMessage}</p>
            <button onClick={() => setStatusMessage(null)} className="text-[#78716C] hover:text-[#EDE8DF] ml-6">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

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
