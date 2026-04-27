import { CreateQuizForm } from "@/components/admin/create-quiz-form";
import { getAdminDashboardData } from "@/lib/data";

export default async function AdminQuizzesPage() {
  const data = await getAdminDashboardData();

  return (
    <div className="space-y-8">
      <header className="border border-slate-200 bg-white p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
          Quizzes
        </p>
        <h1 className="mt-4 text-4xl font-semibold text-slate-950">Quizzes</h1>
        <p className="mt-3 text-sm text-slate-600">
          Manage quiz creation, publishing, updates, and cleanup without leaving the
          admin workspace.
        </p>
      </header>

      <CreateQuizForm mode="landing" quizzes={data.quizzes} />
    </div>
  );
}
