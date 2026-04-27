import { AdminShell } from "@/components/admin/admin-shell";
import { CreateQuizForm } from "@/components/admin/create-quiz-form";
import { requireAdmin } from "@/lib/auth";
import { getAdminDashboardData } from "@/lib/data";

export default async function AdminQuizNewPage() {
  const admin = await requireAdmin("/admin/quizzes/new");

  const data = await getAdminDashboardData();

  return (
    <AdminShell
      admin={admin}
      pathname="/admin/quizzes"
      title="New Quiz"
      description="Build a new quiz on its own page with short and code questions only."
    >
      <CreateQuizForm mode="editor" quizzes={data.quizzes} />
    </AdminShell>
  );
}
