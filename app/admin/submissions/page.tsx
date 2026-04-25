import { AdminShell } from "@/components/admin/admin-shell";
import { SubmissionGrader } from "@/components/admin/submission-grader";
import { ensureDefaultAdmin, getCurrentUser } from "@/lib/auth";
import { getAdminDashboardData } from "@/lib/data";
import { redirect } from "next/navigation";

export default async function AdminSubmissionsPage() {
  await ensureDefaultAdmin();
  const admin = await getCurrentUser();

  if (!admin) {
    redirect("/admin/login");
  }

  if (admin.role !== "admin") {
    redirect("/quizzes");
  }

  const data = await getAdminDashboardData();

  return (
    <AdminShell
      admin={admin}
      pathname="/admin/submissions"
      title="Submissions"
      description="Open one submission at a time, review answers, and grade them without crowding the rest of the admin workflow."
    >
      <SubmissionGrader submissions={data.submissions} />
    </AdminShell>
  );
}
