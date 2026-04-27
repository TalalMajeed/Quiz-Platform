import { AppShell } from "@/components/student/app-shell";
import { PendingLink } from "@/components/ui/pending-link";
import { requireStudent } from "@/lib/auth";
import { getStudentDashboard } from "@/lib/data";

export default async function QuizzesPage() {
  const user = await requireStudent("/quizzes");
  const quizzes = await getStudentDashboard(user.id);

  return (
    <AppShell pathname="/quizzes" user={user}>
      <div className="mx-auto max-w-6xl">
        <div className="border border-slate-200 bg-white p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Quizzes
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-slate-950">
            Available quizzes
          </h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Each quiz has its own time boundary. Open a quiz only when you are ready
            to complete it.
          </p>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="border border-slate-200 bg-white p-7"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
                {quiz.durationMinutes} minutes • {quiz.questionCount} questions • {quiz.attemptsAllowed} attempts
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">{quiz.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{quiz.description}</p>

              {quiz.submission && (
                <div className="mt-5 border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  Status: {quiz.submission.status}
                  {quiz.submission.status === "graded" &&
                    quiz.submission.score !== null &&
                    quiz.submission.maxScore !== null &&
                    ` • Score: ${quiz.submission.score}/${quiz.submission.maxScore}`}
                </div>
              )}

              <PendingLink
                href={`/quizzes/${quiz.id}`}
                pendingLabel="Opening..."
                showLoader
                buttonStyle
                className="mt-6"
              >
                {quiz.submission?.status === "in_progress"
                  ? "Continue Quiz"
                  : "Open Quiz"}
              </PendingLink>
              {quiz.submission?.status === "graded" && (
                <PendingLink
                  href={`/quizzes/${quiz.id}/review`}
                  pendingLabel="Opening..."
                  showLoader
                  buttonStyle
                  variant="secondary"
                  className="mt-6 ml-3"
                >
                  See Review
                </PendingLink>
              )}
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
