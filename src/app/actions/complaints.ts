"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase-server";

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

/** Get the profile for the currently logged-in Clerk user. */
export async function getMyProfile(): Promise<Profile | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const db = createServiceClient();
  const { data, error } = await db
    .from("profiles")
    .select("id, role, full_name, hostel, room")
    .eq("id", userId)
    .single();

  if (error || !data) {
    // Auto-create profile row if it doesn't exist yet (handles local development/webhook delay)
    try {
      const user = await currentUser();
      if (!user) return null;

      const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ") || null;
      const hostel = (user.unsafeMetadata?.hostel as string) || null;
      const room = (user.unsafeMetadata?.room as string) || null;
      const role = (user.unsafeMetadata?.role as "student" | "admin") || "student";

      const { data: newProfile, error: insertError } = await db
        .from("profiles")
        .insert({
          id: userId,
          full_name: fullName,
          hostel,
          room,
          role,
        })
        .select("id, role, full_name, hostel, room")
        .single();

      if (insertError) {
        console.error("Auto-creation of profile failed:", insertError.message);
        return null;
      }
      return newProfile as Profile;
    } catch (e) {
      console.error("Failed to query Clerk currentUser or create profile:", e);
      return null;
    }
  }
  return data as Profile;
}

// ─── Student: complaints ───────────────────────────────────────────────────────

/** Fetch complaints belonging to the currently logged-in student. */
export async function getMyComplaints() {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const db = createServiceClient();
  const { data, error } = await db
    .from("complaints")
    .select("id, title, category, status, priority, created_at")
    .eq("student_id", userId)
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
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

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
      student_id: userId,
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
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const db = createServiceClient();
  const { data: profile } = await db
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (profile?.role !== "admin") throw new Error("Admin access required");
  return userId;
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
