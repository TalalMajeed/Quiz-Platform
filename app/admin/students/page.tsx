import { AdminShell } from "@/components/admin/admin-shell";
import { StudentManagement } from "@/components/admin/student-management";
import { ensureDefaultAdmin, getCurrentUser } from "@/lib/auth";
import { getAdminDashboardData } from "@/lib/data";
import { redirect } from "next/navigation";

export default async function AdminStudentsPage() {
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
      pathname="/admin/students"
      title="Students"
      description="Create student accounts with email and password only, then review the full student list here."
    >
      <StudentManagement students={data.students} />
    </AdminShell>
  );
}
