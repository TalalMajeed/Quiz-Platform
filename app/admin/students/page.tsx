import { AdminShell } from "@/components/admin/admin-shell";
import { StudentManagement } from "@/components/admin/student-management";
import { requireAdmin } from "@/lib/auth";
import { getAdminDashboardData } from "@/lib/data";

export default async function AdminStudentsPage() {
  const admin = await requireAdmin("/admin/students");

  const data = await getAdminDashboardData();

  return (
    <AdminShell
      admin={admin}
      pathname="/admin/students"
      title="Students"
      description="Create, update, and remove student accounts while keeping the roster and submission history in sync."
    >
      <StudentManagement students={data.students} />
    </AdminShell>
  );
}
