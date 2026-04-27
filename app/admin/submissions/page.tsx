import { AdminShell } from "@/components/admin/admin-shell";
import { SubmissionGrader } from "@/components/admin/submission-grader";
import { requireAdmin } from "@/lib/auth";
import { getAdminDashboardData } from "@/lib/data";

export default async function AdminSubmissionsPage() {
  const admin = await requireAdmin("/admin/submissions");

  const data = await getAdminDashboardData();

  return (
    <AdminShell
      admin={admin}
      pathname="/admin/submissions"
      title="Submissions"
      description="Review only completed quiz attempts, update grades, and remove submissions when needed."
    >
      <SubmissionGrader submissions={data.submissions} />
    </AdminShell>
  );
}
