import { AdminShell } from "@/components/admin/admin-shell";
import { CreateQuizForm } from "@/components/admin/create-quiz-form";
import { ensureDefaultAdmin, getCurrentUser } from "@/lib/auth";
import { getAdminDashboardData } from "@/lib/data";
import { redirect } from "next/navigation";

export default async function AdminQuizNewPage() {
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
      title="New Quiz"
      description="Build a new quiz on its own page with short and code questions only."
    >
      <CreateQuizForm mode="editor" quizzes={data.quizzes} />
    </AdminShell>
  );
}
