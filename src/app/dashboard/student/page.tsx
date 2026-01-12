"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, LogOut, Plus, LayoutDashboard, History, Settings, Bell, ChevronRight, Filter, CheckCircle2, MessageSquare, Sun, Moon, Menu, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/components/theme-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  title: z.string().min(4, "Add a short title"),
  category: z.string().min(3, "Choose a category"),
  description: z.string().min(10, "Describe the issue"),
  priority: z.enum(["normal", "urgent"]),
});

const passwordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof formSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

type ComplaintRow = {
  id: string;
  title: string;
  category: string;
  status: "pending" | "in_progress" | "resolved";
  priority: "normal" | "urgent";
  date: string;
};

const seedComplaints: ComplaintRow[] = [
  {
    id: "HC-1021",
    title: "Water supply interruption",
    category: "Water Supply",
    status: "pending",
    priority: "urgent",
    date: "Dec 20, 2025",
  },
  {
    id: "HC-1018",
    title: "WiFi outage on 3rd floor",
    category: "Internet/WiFi",
    status: "in_progress",
    priority: "normal",
    date: "Dec 19, 2025",
  },
  {
    id: "HC-1007",
    title: "Mess food quality",
    category: "Food Quality",
    status: "resolved",
    priority: "normal",
    date: "Dec 18, 2025",
  },
];

const statusBadge = {
  pending: <Badge color="warning">Pending</Badge>,
  in_progress: <Badge color="info">In Progress</Badge>,
  resolved: <Badge color="success">Resolved</Badge>,
};

export default function StudentDashboardPage() {
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
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordUpdating, setPasswordUpdating] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function init() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        router.push("/auth/login");
        return;
      }
      setUser(userData.user);

      const { data, error } = await supabase
        .from("complaints")
        .select("id, title, category, status, priority, created_at")
        .eq("student_id", userData.user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        const mapped = data.map((d: any) => ({
          id: d.id,
          title: d.title,
          category: d.category,
          status: d.status,
          priority: d.priority,
          date: new Date(d.created_at).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
        }));
        setComplaints(mapped);
      }
      setLoading(false);

      // Subscribe to changes
      const channel = supabase
        .channel(`complaints-student-${userData.user.id}`)
        .on(
          "postgres_changes",
          { 
            event: "*", 
            schema: "public", 
            table: "complaints",
            filter: `student_id=eq.${userData.user.id}`
          },
          async () => {
            // Re-fetch everything for simplicity and to maintain order
            const { data: freshData } = await supabase
              .from("complaints")
              .select("id, title, category, status, priority, created_at")
              .eq("student_id", userData.user.id)
              .order("created_at", { ascending: false });

            if (freshData) {
              const updated = freshData.map((d: any) => ({
                id: d.id,
                title: d.title,
                category: d.category,
                status: d.status,
                priority: d.priority,
                date: new Date(d.created_at).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }),
              }));
              setComplaints(updated);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
    const cleanup = init();
    return () => {
      cleanup.then(fn => fn?.());
    };
  }, [router]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { priority: "normal" },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (values: FormData) => {
    setSubmitting(true);
    setError(null);

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      setError("Please sign in before raising a complaint.");
      setSubmitting(false);
      return;
    }

    const { data: inserted, error: insertError } = await supabase
      .from("complaints")
      .insert({
        title: values.title,
        category: values.category,
        description: values.description,
        priority: values.priority,
        status: "pending",
        student_id: userData.user.id,
      })
      .select("id, created_at")
      .limit(1);

    if (insertError) {
      setError(insertError.message ?? "Could not submit complaint");
      setSubmitting(false);
      return;
    }

    const record = inserted?.[0];
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
    setSubmitting(false);
  };

  const onUpdatePassword = async (values: PasswordFormData) => {
    setPasswordUpdating(true);
    setError(null);

    const { error: updateError } = await supabase.auth.updateUser({
      password: values.password,
    });

    if (updateError) {
      setError(updateError.message);
      setPasswordUpdating(false);
      return;
    }

    resetPassword();
    setShowPasswordForm(false);
    setPasswordUpdating(false);
    // Note: In a real app we'd use a toast here
    alert("Password updated successfully!");
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const matchesSearch = `${c.title} ${c.category} ${c.id}`
        .toLowerCase()
        .includes(search.trim().toLowerCase());
      const matchesStatus = statusFilter === "all" || c.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || c.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [complaints, search, statusFilter, priorityFilter]);

  return (
    <div className="flex min-h-screen w-full bg-[#f8fbff] dark:bg-slate-950 transition-colors duration-300">
      {/* Mobile Sidebar Overlay */}
      {showMobileMenu && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setShowMobileMenu(false)}
        />
      )}

      {/* Sidebar - Desktop & Mobile */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-card p-6 transition-transform lg:static lg:block lg:translate-x-0
        ${showMobileMenu ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center gap-3 mb-10">
          <Logo size={32} showText={false} />
          <span className="font-display font-bold text-foreground dark:text-white">Hostel Sync</span>
        </div>

        <nav className="flex-1 space-y-1">
          <NavItem icon={LayoutDashboard} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <NavItem icon={Plus} label="New Complaint" onClick={() => setShowForm(true)} />
          <NavItem icon={History} label="My History" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
          <NavItem icon={Settings} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>

      </aside>

      <div className="flex flex-1 flex-col">
        {/* Top Header */}
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
                  placeholder="Search complaints..." 
                  className="w-full rounded-full border border-border bg-background py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-foreground placeholder:text-muted"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
             </div>
          </div>
          <div className="flex items-center gap-4">
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
              className="group relative flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-slate-400 transition-all hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600"
              title="Log out"
            >
              <LogOut className="h-5 w-5" />
              {signingOut && <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background dark:bg-slate-900/50/80"><div className="h-4 w-4 border-2 border-red-600/20 border-t-red-600 rounded-full animate-spin" /></div>}
            </button>
            <div className="h-8 w-px bg-slate-200" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-foreground dark:text-white">Student Account</p>
                <p className="text-xs text-slate-400">Hostel A, Room 302</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border-2 border-white shadow-sm">
                S
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-10 animate-fade-in">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                 <div className="h-12 w-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                 <p className="text-slate-500 font-medium">Loading your dashboard...</p>
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-6xl">
              <div className="flex flex-col gap-8">
                {activeTab === 'overview' && (
                  <>
                    {/* Header Info */}
                    <div className="flex items-end justify-between">
                      <div>
                        <h1 className="font-display text-3xl font-extrabold text-foreground dark:text-white">Dashboard</h1>
                        <p className="mt-1 text-slate-500">Overview of your hostel complaint history</p>
                      </div>
                      <Button onClick={() => setShowForm(true)} className="rounded-full shadow-lg shadow-blue-100">
                        <Plus className="mr-2 h-4 w-4" /> New Complaint
                      </Button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <StatusCard label="Total Pending" count={complaints.filter(c => c.status === "pending").length} color="amber" />
                      <StatusCard label="In Progress" count={complaints.filter(c => c.status === "in_progress").length} color="blue" />
                      <StatusCard label="Resolved" count={complaints.filter(c => c.status === "resolved").length} color="emerald" />
                    </div>

                    {/* Main List Column */}
                    <div className="space-y-6">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-card p-4 rounded-2xl border border-border shadow-sm">
                         <div className="flex items-center gap-2 px-2">
                             <Filter className="h-4 w-4 text-muted" />
                             <span className="text-sm font-bold text-foreground">Filters:</span>
                         </div>
                         <div className="flex flex-wrap gap-2">
                            <select 
                              className="rounded-full border border-border bg-background px-4 py-1.5 text-xs font-bold text-foreground outline-none focus:ring-2 focus:ring-blue-500/10"
                              value={statusFilter}
                              onChange={(e) => setStatusFilter(e.target.value as any)}
                            >
                               <option value="all">All Status</option>
                               <option value="pending">Pending</option>
                               <option value="in_progress">In Progress</option>
                               <option value="resolved">Resolved</option>
                            </select>
                            <select 
                              className="rounded-full border border-border bg-background px-4 py-1.5 text-xs font-bold text-foreground outline-none focus:ring-2 focus:ring-blue-500/10"
                              value={priorityFilter}
                              onChange={(e) => setPriorityFilter(e.target.value as any)}
                            >
                               <option value="all">All Priority</option>
                               <option value="normal">Normal</option>
                               <option value="urgent">Urgent</option>
                            </select>
                         </div>
                      </div>

                      <div className="grid gap-4">
                        {filteredComplaints.slice(0, 5).map((item) => (
                          <ComplaintItem key={item.id} item={item} onClick={() => setSelected(item)} />
                        ))}
                        {filteredComplaints.length === 0 && (
                          <div className="text-center py-20 bg-card rounded-2xl border border-dashed border-border transition-colors">
                            <p className="text-slate-500 font-medium">No complaints found matching your criteria.</p>
                            <Button variant="ghost" onClick={() => {setSearch(""); setStatusFilter("all"); setPriorityFilter("all")}} className="mt-2 text-blue-600 font-bold">Clear Filters</Button>
                          </div>
                        )}
                        {filteredComplaints.length > 5 && (
                          <Button variant="ghost" className="w-full text-blue-600 font-bold" onClick={() => setActiveTab('history')}>
                            View all history <ChevronRight className="ml-2 h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'history' && (
                  <div className="space-y-8">
                    <div>
                      <h1 className="font-display text-3xl font-extrabold text-foreground dark:text-white">Complaint History</h1>
                      <p className="mt-1 text-slate-500">Trace your past reports and their resolutions</p>
                    </div>

                    <div className="grid gap-4">
                      {complaints.length > 0 ? (
                        complaints.map((item) => (
                          <ComplaintItem key={item.id} item={item} onClick={() => setSelected(item)} />
                        ))
                      ) : (
                        <div className="text-center py-20 bg-background dark:bg-slate-900/50 rounded-2xl border border-dashed border-border">
                           <History className="mx-auto h-12 w-12 text-muted mb-4" />
                           <p className="text-slate-500 font-medium">No history to show yet.</p>
                           <Button variant="ghost" className="mt-2 text-blue-600 font-bold" onClick={() => setShowForm(true)}>Raise your first complaint</Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div className="space-y-8">
                    <div>
                      <h1 className="font-display text-3xl font-extrabold text-foreground dark:text-white">Account Settings</h1>
                      <p className="mt-1 text-slate-500">Manage your profile and preferences</p>
                    </div>

                    <Card className="max-w-2xl">
                      <CardHeader>
                        <h3 className="font-bold text-lg">Profile Information</h3>
                        <p className="text-sm text-slate-500">Your details as registered in the system</p>
                      </CardHeader>
                      <CardContent className="space-y-6">
                         <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-1">
                               <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</p>
                               <p className="text-sm font-medium text-foreground dark:text-white">{user?.email}</p>
                            </div>
                            <div className="space-y-1">
                               <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account Role</p>
                               <Badge color="info">Student</Badge>
                            </div>
                            <div className="space-y-1">
                               <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Last Login</p>
                               <p className="text-sm font-medium text-foreground dark:text-white">{user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Just now'}</p>
                            </div>
                         </div>
                         <div className="pt-4 border-t border-slate-100">
                            <Button variant="outline" className="rounded-xl" onClick={() => setShowPasswordForm(true)}>Update Password</Button>
                         </div>
                      </CardContent>
                    </Card>

                    {/* Update Password Modal */}
                    {showPasswordForm && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                        <Card className="w-full max-w-md bg-card shadow-2xl animate-slide-up border-border">
                          <CardHeader>
                            <h2 className="font-display text-xl font-bold">Update Password</h2>
                            <p className="text-sm text-slate-500">Enter a new secure password for your account</p>
                          </CardHeader>
                          <CardContent>
                            <form className="grid gap-4" onSubmit={handlePasswordSubmit(onUpdatePassword)}>
                              <Input 
                                label="New Password" 
                                type="password" 
                                placeholder="••••••••" 
                                {...registerPassword("password")} 
                                aria-invalid={!!passwordErrors.password} 
                                className="h-11 rounded-xl" 
                              />
                              {passwordErrors.password && <p className="text-xs font-bold text-red-500">{passwordErrors.password.message}</p>}
                              
                              <Input 
                                label="Confirm New Password" 
                                type="password" 
                                placeholder="••••••••" 
                                {...registerPassword("confirmPassword")} 
                                aria-invalid={!!passwordErrors.confirmPassword} 
                                className="h-11 rounded-xl" 
                              />
                              {passwordErrors.confirmPassword && <p className="text-xs font-bold text-red-500">{passwordErrors.confirmPassword.message}</p>}
                              
                              {error && <p className="text-sm font-bold text-red-500">{error}</p>}
                              
                              <div className="flex items-center justify-end gap-3 mt-4">
                                <Button type="button" variant="ghost" className="rounded-xl" onClick={() => setShowPasswordForm(false)} disabled={passwordUpdating}>Cancel</Button>
                                <Button type="submit" className="rounded-xl px-8" disabled={passwordUpdating}>
                                  {passwordUpdating ? "Updating..." : "Update Password"}
                                </Button>
                              </div>
                            </form>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>
                )}

                {showForm && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                    <Card className="w-full max-w-2xl bg-card shadow-2xl animate-slide-up border-border">
                      <CardHeader>
                        <h2 className="font-display text-xl font-bold">Raise New Complaint</h2>
                        <p className="text-sm text-slate-500">Provide details about the issue you are facing</p>
                      </CardHeader>
                      <CardContent>
                        <form className="grid gap-6 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
                          <div className="md:col-span-2">
                            <Input label="Short Title" placeholder="e.g. WiFi not working in Room 402" {...register("title")} aria-invalid={!!errors.title} className="h-11 rounded-xl" />
                            {errors.title && <p className="mt-1 text-xs font-bold text-red-500">{errors.title.message}</p>}
                          </div>
                          <Input label="Category" placeholder="e.g. Electricity, Water, WiFi" {...register("category")} aria-invalid={!!errors.category} className="h-11 rounded-xl" />
                          <Select label="Priority" {...register("priority")} className="h-11 rounded-xl">
                            <option value="normal">Normal</option>
                            <option value="urgent">Urgent</option>
                          </Select>
                          <div className="md:col-span-2">
                            <Textarea
                              label="Detailed Description"
                              placeholder="Please explain the issue in detail..."
                              rows={4}
                              {...register("description")}
                              aria-invalid={!!errors.description}
                              className="rounded-xl"
                            />
                            {errors.description && <p className="mt-1 text-xs font-bold text-red-500">{errors.description.message}</p>}
                          </div>
                          {error && <p className="md:col-span-2 text-sm font-bold text-red-500">{error}</p>}
                          <div className="md:col-span-2 flex items-center justify-end gap-3 mt-4">
                            <Button type="button" variant="ghost" className="rounded-xl" onClick={() => setShowForm(false)} disabled={submitting}>Cancel</Button>
                            <Button type="submit" className="rounded-xl px-8" disabled={submitting}>
                              {submitting ? "Submitting..." : "Submit Complaint"}
                            </Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md bg-card shadow-2xl animate-slide-up border-border">
             <CardHeader className="relative">
                <button 
                  onClick={() => setSelected(null)}
                  className="absolute right-4 top-4 h-8 w-8 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors"
                >
                  <Plus className="h-5 w-5 rotate-45 text-slate-400" />
                </button>
                <div className="flex items-center gap-2">
                   <Badge color={selected?.status === 'resolved' ? 'success' : selected?.status === 'in_progress' ? 'info' : 'warning'}>
                      {selected?.status.replace('_', ' ')}
                   </Badge>
                   <Badge color={selected?.priority === 'urgent' ? 'danger' : 'neutral'}>{selected?.priority}</Badge>
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground dark:text-white mt-4">{selected?.title}</h3>
                <p className="text-sm text-slate-500">#{selected?.id} • {selected?.category} • {selected?.date}</p>
             </CardHeader>
             <CardContent>
                <div className="space-y-6">
                    <div className="rounded-xl bg-background border border-border p-4">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Detailed Status</p>
                      <TimelineItem label="Complaint Received" time={selected?.date || ''} status="complete" />
                      <TimelineItem label="Under Review" time="Pending" status={selected?.status === 'pending' ? 'active' : 'complete'} />
                      <TimelineItem label="Issue Resolved" time="Pending" status={selected?.status === 'resolved' ? 'complete' : selected?.status === 'in_progress' ? 'active' : 'pending'} />
                   </div>
                   
                   <Button variant="secondary" className="w-full rounded-xl h-11" onClick={() => setSelected(null)}>Close View</Button>
                </div>
             </CardContent>
          </Card>
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

function ComplaintItem({ item, onClick }: { item: ComplaintRow, onClick: () => void }) {
  return (
    <div 
      className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 transition-all hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-md hover:shadow-blue-50/50 dark:hover:shadow-none cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors ${item.status === 'resolved' ? 'bg-emerald-50 dark:bg-emerald-600/10 text-emerald-600 dark:text-emerald-400' : 'bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400'}`}>
           {item.status === 'resolved' ? <CheckCircle2 className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display font-bold text-foreground dark:text-white">{item.title}</h3>
            <Badge color={item.priority === "urgent" ? "danger" : "neutral"}>{item.priority}</Badge>
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs font-medium text-slate-500">
            <span>#{item.id}</span>
            <span>•</span>
            <span>{item.category}</span>
            <span>•</span>
            <span>{item.date}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 w-full sm:w-auto self-end sm:self-center">
        <div className="hidden sm:block text-right mr-2">
           {item.status === "pending" && <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">Awaiting Review</span>}
           {item.status === "in_progress" && <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">In Progress</span>}
            {item.status === "resolved" && <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Fixed & Closed</span>}
        </div>
        <div className="h-8 w-8 rounded-full border border-border flex items-center justify-center text-muted group-hover:bg-blue-600 group-hover:text-white transition-all">
           <ChevronRight className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

function StatusCard({ label, count, color }: { label: string, count: number, color: 'amber' | 'blue' | 'emerald' }) {
  const colorMap = {
    amber: 'bg-amber-50 dark:bg-amber-600/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/50',
    blue: 'bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/50',
    emerald: 'bg-emerald-50 dark:bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50'
  };
  
  return (
    <Card className={`${colorMap[color]} border shadow-sm`}>
      <CardHeader className="pb-2">
        <p className="text-xs font-bold uppercase tracking-wider opacity-80">{label}</p>
      </CardHeader>
      <CardContent>
        <p className="text-4xl font-extrabold">{count}</p>
      </CardContent>
    </Card>
  );
}

function TimelineItem({ label, time, status }: { label: string; time: string; status: "complete" | "active" | "pending" }) {
  return (
    <div className="flex items-start gap-3 mb-4 last:mb-0">
      <div className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center">
        {status === "complete" ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        ) : status === "active" ? (
          <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-blue-600 ring-4 ring-blue-100 dark:ring-blue-900/40" />
        ) : (
          <div className="h-2 w-2 rounded-full bg-border" />
        )}
      </div>
      <div>
        <p className={`text-sm font-bold ${status === "pending" ? "text-slate-400" : "text-foreground"}`}>{label}</p>
        <p className="text-[10px] font-medium text-slate-500 uppercase">{time}</p>
      </div>
    </div>
  );
}
