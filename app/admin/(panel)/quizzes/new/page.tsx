import { CreateQuizForm } from "@/components/admin/create-quiz-form";
import { getAdminDashboardData } from "@/lib/data";

export default async function AdminQuizNewPage() {
  const data = await getAdminDashboardData();

  return (
    <div className="space-y-8">
      <header className="border border-slate-200 bg-white p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
          New Quiz
        </p>
        <h1 className="mt-4 text-4xl font-semibold text-slate-950">New Quiz</h1>
        <p className="mt-3 text-sm text-slate-600">
          Build a new quiz on its own page with short and code questions only.
        </p>
      </header>

      <CreateQuizForm mode="editor" quizzes={data.quizzes} />
    </div>
  );
}
