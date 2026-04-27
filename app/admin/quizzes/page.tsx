import { AdminShell } from "@/components/admin/admin-shell";
import { CreateQuizForm } from "@/components/admin/create-quiz-form";
import { requireAdmin } from "@/lib/auth";
import { getAdminDashboardData } from "@/lib/data";

export default async function AdminQuizzesPage() {
  const admin = await requireAdmin("/admin/quizzes");

  const data = await getAdminDashboardData();

  return (
    <AdminShell
      admin={admin}
      pathname="/admin/quizzes"
      title="Quizzes"
      description="Manage quiz creation, publishing, updates, and cleanup without leaving the admin workspace."
    >
      <CreateQuizForm mode="landing" quizzes={data.quizzes} />
    </AdminShell>
  );
}
