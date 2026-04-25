import { AdminShell } from "@/components/admin/admin-shell";
import { CreateQuizForm } from "@/components/admin/create-quiz-form";
import { ensureDefaultAdmin, getCurrentUser } from "@/lib/auth";
import { getAdminDashboardData } from "@/lib/data";
import { redirect } from "next/navigation";

export default async function AdminQuizzesPage() {
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
      pathname="/admin/quizzes"
      title="Quizzes"
      description="Create timed quizzes on a dedicated page instead of squeezing everything into one dashboard."
    >
      <CreateQuizForm mode="landing" quizzes={data.quizzes} />
    </AdminShell>
  );
}
