import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase-server";

// Server component that reads the user's role from profiles and redirects accordingly.
export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const db = createServiceClient();
  const { data: profile } = await db
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (profile?.role === "admin") {
    redirect("/dashboard/admin");
  }

  redirect("/dashboard/student");
}
