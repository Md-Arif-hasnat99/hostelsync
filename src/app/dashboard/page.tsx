import { redirect } from "next/navigation";
import { getMyProfile } from "@/app/actions/complaints";

// Server component that reads the user's role from profiles and redirects accordingly.
// Utilizes getMyProfile which automatically handles missing profiles for newly registered users.
export default async function DashboardPage() {
  const profile = await getMyProfile();

  if (!profile) {
    redirect("/sign-in");
  }

  if (profile.role === "admin") {
    redirect("/dashboard/admin");
  }

  redirect("/dashboard/student");
}
