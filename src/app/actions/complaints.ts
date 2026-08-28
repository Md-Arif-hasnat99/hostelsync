"use server";

import { createServerSupabaseClient, createServiceClient } from "@/lib/supabase-server";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ComplaintRow = {
  id: string;
  title: string;
  category: string;
  status: "pending" | "in_progress" | "resolved";
  priority: "normal" | "urgent";
  student_id: string | null;
  created_at: string | null;
};

export type Profile = {
  id: string;
  role: "student" | "admin";
  full_name: string | null;
  hostel: string | null;
  room: string | null;
};

// ─── Profile ──────────────────────────────────────────────────────────────────

/** Get the profile for the currently logged-in Supabase user. */
export async function getMyProfile(): Promise<Profile | null> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const db = createServiceClient();
  const { data, error } = await db
    .from("profiles")
    .select("id, role, full_name, hostel, room")
    .eq("id", user.id)
    .single();

  if (error || !data) return null;
  return data as Profile;
}

// ─── Student: complaints ───────────────────────────────────────────────────────

/** Fetch complaints belonging to the currently logged-in student. */
export async function getMyComplaints() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const db = createServiceClient();
  const { data, error } = await db
    .from("complaints")
    .select("id, title, category, status, priority, created_at")
    .eq("student_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

/** Submit a new complaint for the currently logged-in student. */
export async function submitComplaint(values: {
  title: string;
  category: string;
  description: string;
  priority: "normal" | "urgent";
}) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Verify student role before allowing insert
  const profile = await getMyProfile();
  if (!profile) throw new Error("Profile not found");
  if (profile.role !== "student") throw new Error("Only students can file complaints");

  const db = createServiceClient();
  const { data, error } = await db
    .from("complaints")
    .insert({
      title: values.title,
      category: values.category,
      description: values.description,
      priority: values.priority,
      status: "pending",
      student_id: user.id,
    })
    .select("id, created_at")
    .limit(1)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ─── Admin: complaints ─────────────────────────────────────────────────────────

/** Verify that the current user is an admin. Throws if not. */
async function requireAdmin() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const db = createServiceClient();
  const { data: profile } = await db
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Admin access required");
  return user.id;
}

/** Fetch all complaints (admin only). */
export async function getAllComplaints(): Promise<ComplaintRow[]> {
  await requireAdmin();

  const db = createServiceClient();
  const { data, error } = await db
    .from("complaints")
    .select("id, title, category, status, priority, created_at, student_id")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as ComplaintRow[];
}

/** Update the status of a single complaint (admin only). */
export async function updateComplaintStatus(
  id: string,
  status: ComplaintRow["status"]
) {
  await requireAdmin();

  const db = createServiceClient();
  const { error } = await db
    .from("complaints")
    .update({ status })
    .eq("id", id);

  if (error) throw new Error(error.message);
}

/** Bulk-triage all pending complaints to in_progress (admin only). */
export async function triagePending() {
  await requireAdmin();

  const db = createServiceClient();
  const { error } = await db
    .from("complaints")
    .update({ status: "in_progress" })
    .eq("status", "pending");

  if (error) throw new Error(error.message);
}
