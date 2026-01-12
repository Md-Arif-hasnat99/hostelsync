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
import { Search, LogOut, LayoutDashboard, Settings, ChevronRight, Filter, Download, Zap, RefreshCcw, TrendingUp, Users, AlertCircle, History, Plus, Sun, Moon, Menu, X } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import Image from "next/image";

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

const chartData = {
  labels: ["Water", "Electricity", "Internet", "Food", "Cleanliness", "Maintenance"],
  datasets: [
    {
      label: "Complaints",
      data: [5, 3, 4, 2, 6, 4],
      backgroundColor: "rgba(37, 99, 235, 0.2)",
      borderColor: "rgba(37, 99, 235, 1)",
      borderWidth: 1,
    },
  ],
};

export default function AdminDashboardPage() {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"all" | ComplaintRow["status"]>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [realtimeStatus, setRealtimeStatus] = useState<"connecting" | "active" | "error">("connecting");
  const [activeTab, setActiveTab] = useState<"operations" | "students" | "logs" | "governance">("operations");
  const [categories, setCategories] = useState(["Water", "Electricity", "Internet", "Mess", "Security"]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [showManageRoles, setShowManageRoles] = useState(false);
  const [admins, setAdmins] = useState([
    { name: "Admin One", role: "Super Admin", email: "admin1@hostelsync.com" },
    { name: "Support Agent", role: "Manager", email: "support@hostelsync.com" },
  ]);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Auth check
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push("/auth/login?role=admin");
      }
    });
  }, [router]);

  // Subscribe to Supabase changes so new/updated complaints appear without manual refresh.
  useEffect(() => {
    const channel = supabase
      .channel("complaints-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "complaints" },
        async (payload) => {
          await queryClient.invalidateQueries({ queryKey: ["complaints"] });
          if (payload.eventType === "INSERT") {
             setStatusMessage("New complaint received just now!");
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
    if (error) {
      throw new Error(error.message);
    }
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
      { label: "Total Issues", value: total, icon: History, color: "blue" },
      { label: "Pending Review", value: pending, icon: AlertCircle, color: "amber" },
      { label: "Active Work", value: inProgress, icon: Zap, color: "blue" },
      { label: "Resolved", value: resolved, icon: TrendingUp, color: "emerald" },
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
    setStatusMessage(`Updated complaint ${id.slice(0, 6)} to ${status.replace("_", " ")}.`);
    await queryClient.invalidateQueries({ queryKey: ["complaints"] });
    await refetch();
    setUpdating(false);
  };

  return (
    <div className="flex min-h-screen w-full bg-background transition-colors duration-300">
      {/* Mobile Sidebar Overlay */}
      {showMobileMenu && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setShowMobileMenu(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-card p-6 transition-transform lg:static lg:block lg:translate-x-0
        ${showMobileMenu ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center gap-3 mb-10">
          <Logo size={32} showText={false} />
          <span className="font-display font-bold text-foreground dark:text-white">Admin Sync</span>
        </div>

        <nav className="flex-1 space-y-1">
          <NavItem icon={LayoutDashboard} label="Operations" active={activeTab === 'operations'} onClick={() => setActiveTab('operations')} />
          <NavItem icon={Users} label="Student List" active={activeTab === 'students'} onClick={() => setActiveTab('students')} />
          <NavItem icon={History} label="Audit Logs" active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} />
          <NavItem icon={Settings} label="Governance" active={activeTab === 'governance'} onClick={() => setActiveTab('governance')} />
        </nav>

      </aside>

      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6 lg:px-10 transition-colors">
          <div className="flex items-center gap-4 flex-1">
             {/* Mobile Menu Toggle */}
             <button 
               onClick={() => setShowMobileMenu(!showMobileMenu)}
               className="lg:hidden p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
             >
               {showMobileMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
             </button>

             <div className="relative max-w-md w-full hidden md:block">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Global search..." 
                  className="w-full rounded-full border border-border bg-background px-10 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-foreground"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => refetch()} 
              disabled={isFetching}
              className={`p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all ${isFetching ? 'animate-spin text-blue-600' : ''}`}
            >
              <RefreshCcw className="h-4 w-4" />
            </button>
            <div className="h-8 w-px bg-slate-200" />
            <button 
              onClick={toggleTheme}
              className="rounded-full p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>
            <div className="h-8 w-px bg-slate-200" />
            <button 
              onClick={handleSignOut}
              disabled={signingOut}
              className="group relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-background dark:bg-slate-900/50 dark:bg-slate-900 text-slate-400 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              title="Log out"
            >
              <LogOut className="h-5 w-5" />
              {signingOut && <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background dark:bg-slate-900/50 dark:bg-slate-900/80"><div className="h-4 w-4 border-2 border-red-600/20 border-t-red-600 rounded-full animate-spin" /></div>}
            </button>
            <div className="h-8 w-px bg-slate-200" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-foreground dark:text-white">Admin Portal</p>
                <p className="text-xs text-emerald-500 font-bold">System Online</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center text-slate-600 font-bold">A</div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-10 animate-fade-in">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-8">
              {activeTab === 'operations' && (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                      <h1 className="font-display text-3xl font-extrabold text-foreground dark:text-white">System Overview</h1>
                      <p className="mt-1 text-slate-500">Live monitoring and complaint management</p>
                    </div>
                    <div className="flex items-center gap-3">
                       <Button variant="outline" onClick={handleExport} className="rounded-xl border-slate-300">
                          <Download className="mr-2 h-4 w-4" /> Export
                       </Button>
                       <Button onClick={handleUpdateStatus} className="rounded-xl bg-blue-600 hover:bg-blue-700">
                          <Zap className="mr-2 h-4 w-4" /> Triage Pending
                       </Button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {summary.map((item) => (
                      <Card key={item.label} className="relative overflow-hidden group">
                         <div className={`absolute top-0 right-0 h-16 w-16 -translate-y-4 translate-x-4 opacity-5 bg-${item.color}-600 rounded-full transition-transform group-hover:scale-150`} />
                         <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                               <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{item.label}</p>
                               <item.icon className={`h-4 w-4 text-${item.color}-500`} />
                            </div>
                         </CardHeader>
                         <CardContent>
                            <p className="text-3xl font-extrabold text-foreground dark:text-white">{item.value}</p>
                         </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Main Content Grid */}
                  <div className="grid gap-8 lg:grid-cols-3">
                    {/* Table Section */}
                    <div className="lg:col-span-2 space-y-4">
                       <div className="flex items-center justify-between bg-background dark:bg-slate-900/50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 shadow-sm">
                          <div className="flex items-center gap-3">
                             <Filter className="h-4 w-4 text-slate-400" />
                             <span className="text-sm font-bold text-slate-700">Display Filters</span>
                          </div>
                          <select 
                            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-600 outline-none"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as any)}
                          >
                             <option value="all">Every Status</option>
                             <option value="pending">Pending Review</option>
                             <option value="in_progress">In Progress</option>
                             <option value="resolved">Resolved</option>
                          </select>
                       </div>

                       <Card className="border-slate-200 shadow-sm overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                              <thead className="bg-slate-50/50 text-xs font-bold uppercase tracking-wider text-slate-400">
                                <tr>
                                   <th className="px-6 py-4">Complaint Path</th>
                                   <th className="px-6 py-4">Received</th>
                                   <th className="px-6 py-4">Student</th>
                                   <th className="px-6 py-4">Urgency</th>
                                   <th className="px-6 py-4">Work Status</th>
                                   <th className="px-6 py-4 text-right">Transition</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 bg-background dark:bg-slate-900/50 dark:bg-slate-900">
                                {filteredComplaints.length > 0 ? (
                                  filteredComplaints.map((c) => (
                                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                                      <td className="px-6 py-4">
                                        <div>
                                          <p className="font-bold text-foreground dark:text-white">{c.title}</p>
                                          <p className="text-xs text-slate-400">{c.category}</p>
                                        </div>
                                      </td>
                                      <td className="px-6 py-4">
                                         <p className="text-xs font-bold text-slate-600">
                                           {c.created_at ? new Date(c.created_at).toLocaleDateString() : 'N/A'}
                                         </p>
                                         <p className="text-[10px] text-slate-400">
                                           {c.created_at ? new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                         </p>
                                      </td>
                                      <td className="px-6 py-4">
                                         <p className="text-xs font-bold text-slate-600">
                                           ID: {c.student_id ? c.student_id.slice(0, 8) : 'Unknown'}
                                         </p>
                                      </td>
                                      <td className="px-6 py-4">
                                        <Badge color={c.priority === "urgent" ? "danger" : "info"}>
                                          {c.priority}
                                        </Badge>
                                      </td>
                                      <td className="px-6 py-4">
                                         <div className="flex items-center gap-2">
                                            <div className={`h-2 w-2 rounded-full ${c.status === 'resolved' ? 'bg-emerald-500' : c.status === 'in_progress' ? 'bg-blue-500' : 'bg-amber-500'}`} />
                                            <span className="font-bold text-slate-700 capitalize">{c.status.replace('_', ' ')}</span>
                                         </div>
                                      </td>
                                      <td className="px-6 py-4 text-right">
                                        <select 
                                          className="rounded-lg border border-slate-200 bg-background dark:bg-slate-900/50 dark:bg-slate-900 px-2 py-1 text-xs font-bold text-slate-600 shadow-sm"
                                          value={c.status}
                                          onChange={(e) => handleStatusUpdate(c.id, e.target.value as any)}
                                        >
                                          <option value="pending">Mark Pending</option>
                                          <option value="in_progress">Start Work</option>
                                          <option value="resolved">Close Ticket</option>
                                        </select>
                                      </td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center text-slate-500 font-medium">
                                      {isLoading ? "Fetching complaints..." : "No complaints found matching filters."}
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                       </Card>
                    </div>

                    {/* Right Column: Analytics & Quick Actions */}
                    <div className="space-y-6">
                       <Card className="border-slate-200 shadow-sm">
                          <CardHeader>
                             <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Triage Trends</p>
                             <h3 className="font-display text-lg font-bold text-foreground dark:text-white">Category Mix</h3>
                          </CardHeader>
                          <CardContent>
                             <div className="h-[240px] w-full">
                                <Bar 
                                  data={chartData} 
                                  options={{ 
                                    responsive: true, 
                                    maintainAspectRatio: false,
                                    plugins: { legend: { display: false } },
                                    scales: { x: { grid: { display: false } }, y: { grid: { color: "#f1f5f9" }, ticks: { precision: 0 } } }
                                  }} 
                                />
                             </div>
                          </CardContent>
                       </Card>

                       <Card className="!bg-blue-600 dark:!bg-blue-950 text-white border-none shadow-xl shadow-blue-500/10">
                          <CardHeader>
                             <p className="text-xs font-extrabold uppercase tracking-wider text-blue-100/80">System Notification</p>
                             <h3 className="font-display text-lg font-bold text-white">Operational Status</h3>
                          </CardHeader>
                          <CardContent className="space-y-4">
                              <div className="flex items-center justify-between rounded-xl bg-white/20 dark:bg-blue-800/40 border border-white/10 dark:border-blue-700/30 p-4">
                                 <div className="flex items-center gap-3">
                                    <div className={`h-2 w-2 rounded-full shadow-[0_0_8px] ${realtimeStatus === 'active' ? 'bg-emerald-400 shadow-emerald-400' : realtimeStatus === 'connecting' ? 'bg-amber-400 shadow-amber-400' : 'bg-red-400 shadow-red-400'}`} />
                                    <span className="text-sm font-bold text-white">
                                      {realtimeStatus === 'active' ? 'Auto-Sync Enabled' : realtimeStatus === 'connecting' ? 'Connecting sync...' : 'Sync Error'}
                                    </span>
                                 </div>
                                 <span className="text-[10px] font-bold text-blue-50 uppercase">
                                   {realtimeStatus === 'active' ? 'Active' : realtimeStatus === 'connecting' ? 'Wait' : 'Offline'}
                                 </span>
                              </div>
                             <p className="text-xs text-blue-50 leading-relaxed font-medium">
                                 The system is currently syncing with the main database. New complaints will appear in real-time.
                             </p>
                          </CardContent>
                       </Card>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'students' && (
                <div className="space-y-6">
                  <div>
                    <h1 className="font-display text-3xl font-extrabold text-foreground dark:text-white">Student Directory</h1>
                    <p className="mt-1 text-slate-500">Manage hostel residents and their profiles</p>
                  </div>
                  <Card className="border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-400">
                          <tr>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Room</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-background dark:bg-slate-900/50 dark:bg-slate-900">
                          {[
                            { name: "Md Arif Hasnat", room: "A-302", active: true },
                            { name: "Sifat Rahman", room: "B-105", active: true },
                            { name: "Tanvir Ahmed", room: "C-420", active: false },
                          ].map((s, i) => (
                            <tr key={i} className="hover:bg-slate-50">
                              <td className="px-6 py-4 font-bold text-foreground dark:text-white">{s.name}</td>
                              <td className="px-6 py-4 font-medium text-slate-600">{s.room}</td>
                              <td className="px-6 py-4">
                                <Badge color={s.active ? "success" : "neutral"}>{s.active ? "Active" : "Inactive"}</Badge>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <Button variant="ghost" size="sm" className="text-blue-600 font-bold">Edit Profile</Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
              )}

              {activeTab === 'logs' && (
                <div className="space-y-6">
                  <div>
                    <h1 className="font-display text-3xl font-extrabold text-foreground dark:text-white">Audit Logs</h1>
                    <p className="mt-1 text-slate-500">Record of all administrative actions</p>
                  </div>
                  <div className="grid gap-4">
                    {[
                      { action: "Status Update", detail: "Complaint #HC-1021 moved to In Progress", user: "Admin", time: "2 mins ago" },
                      { action: "Export Data", detail: "Monthly report downloaded as CSV", user: "Admin", time: "1 hour ago" },
                      { action: "User Login", detail: "Admin portal accessed from IP 192.168.1.1", user: "Admin", time: "3 hours ago" },
                    ].map((log, i) => (
                      <Card key={i} className="p-4 border-slate-100 transition-all hover:bg-slate-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                              <History className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-bold text-foreground dark:text-white">{log.action}</p>
                              <p className="text-sm text-slate-500">{log.detail}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{log.user}</p>
                            <p className="text-xs text-slate-400">{log.time}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'governance' && (
                <div className="space-y-6">
                  <div>
                    <h1 className="font-display text-3xl font-extrabold text-foreground dark:text-white">System Governance</h1>
                    <p className="mt-1 text-slate-500">Configure hostel rules and application settings</p>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    <Card className="p-6">
                      <h3 className="font-bold text-lg mb-4">Complaint Categories</h3>
                      <div className="flex flex-wrap gap-2">
                        {categories.map(c => (
                          <Badge key={c} color="info" className="px-3 py-1">{c}</Badge>
                        ))}
                        <Button variant="outline" size="sm" className="rounded-full" onClick={() => setShowAddCategory(true)}><Plus className="h-3 w-3 mr-1" /> Add New</Button>
                      </div>
                    </Card>
                    <Card className="p-6">
                      <h3 className="font-bold text-lg mb-4">Access Control</h3>
                      <p className="text-sm text-slate-500 mb-4">Manage admins and permission levels</p>
                      <Button variant="secondary" className="w-full" onClick={() => setShowManageRoles(true)}>Manage Roles</Button>
                    </Card>
                  </div>

                  {/* Add Category Modal */}
                  {showAddCategory && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                      <Card className="w-full max-w-sm bg-background dark:bg-slate-900/50 dark:bg-slate-900 shadow-2xl animate-slide-up">
                        <CardHeader>
                          <h3 className="font-bold text-lg">Add New Category</h3>
                          <p className="text-sm text-slate-500">Define a new issue category for students</p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Category Name</label>
                            <input 
                              type="text" 
                              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                              placeholder="e.g. Plumbing, Furniture"
                              value={newCategory}
                              onChange={(e) => setNewCategory(e.target.value)}
                            />
                          </div>
                          <div className="flex justify-end gap-3 mt-4">
                            <Button variant="ghost" onClick={() => setShowAddCategory(false)}>Cancel</Button>
                            <Button className="bg-blue-600" onClick={() => {
                              if (newCategory.trim()) {
                                setCategories([...categories, newCategory.trim()]);
                                setNewCategory("");
                                setShowAddCategory(false);
                                setStatusMessage(`Added new category: ${newCategory}`);
                              }
                            }}>Save Category</Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Manage Roles Modal */}
                  {showManageRoles && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                      <Card className="w-full max-w-2xl bg-background dark:bg-slate-900/50 dark:bg-slate-900 shadow-2xl animate-slide-up">
                        <CardHeader className="flex flex-row items-center justify-between">
                          <div>
                            <h3 className="font-bold text-lg">Administrator Hierarchy</h3>
                            <p className="text-sm text-slate-500">Assign permission levels to staff</p>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => setShowManageRoles(false)}><Plus className="h-5 w-5 rotate-45" /></Button>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {admins.map((admin, idx) => (
                              <div key={idx} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
                                <div className="flex items-center gap-4">
                                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                                    {admin.name[0]}
                                  </div>
                                  <div>
                                    <p className="font-bold text-foreground dark:text-white">{admin.name}</p>
                                    <p className="text-xs text-slate-500">{admin.email}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Badge color={admin.role === 'Super Admin' ? 'danger' : 'info'}>{admin.role}</Badge>
                                  <Button variant="ghost" size="sm" className="text-slate-400 hover:text-blue-600">Modify</Button>
                                </div>
                              </div>
                            ))}
                            <Button variant="outline" className="w-full border-dashed border-2 rounded-2xl py-6" onClick={() => setStatusMessage("Admin registration is currently restricted.")}>
                              <Plus className="mr-2 h-4 w-4" /> Invite New Administrator
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Success Notification Toast Mockup */}
      {statusMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
           <div className="flex items-center gap-3 rounded-2xl bg-slate-900 px-6 py-4 text-white shadow-2xl">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500">
                 <Plus className="h-4 w-4 rotate-45" />
              </div>
              <p className="text-sm font-bold">{statusMessage}</p>
              <button onClick={() => setStatusMessage(null)} className="ml-4 text-slate-400 hover:text-white transition-colors">
                 <Plus className="h-4 w-4 rotate-45" />
              </button>
           </div>
        </div>
      )}
    </div>
  );
}

function NavItem({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${active ? 'bg-blue-50 dark:bg-blue-600/10 text-blue-700 dark:text-blue-400 shadow-sm shadow-blue-100 dark:shadow-none font-extrabold' : 'text-muted hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-foreground'}`}
    >
      <Icon className={`h-4 w-4 ${active ? 'text-blue-600' : ''}`} />
      {label}
    </button>
  );
}
