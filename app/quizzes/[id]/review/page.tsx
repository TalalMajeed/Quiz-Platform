import ReactMarkdown from "react-markdown";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/student/app-shell";
import { PendingLink } from "@/components/ui/pending-link";
import { requireStudent } from "@/lib/auth";
import { getStudentReviewData } from "@/lib/data";

type ReviewQuestion = {
  _id: { toString(): string };
  prompt: string;
  type: "short" | "code";
  points: number;
};

type ReviewAnswer = {
  questionId: string;
  responseText: string;
  code: string;
  awardedPoints: number;
  feedback: string;
};

export default async function QuizReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireStudent(`/quizzes/${id}/review`);
  const data = await getStudentReviewData(id, user.id);

  if (!data) {
    notFound();
  }

  if (!data.submission) {
    return (
      <AppShell pathname="/quizzes" user={user}>
        <div className="mx-auto max-w-4xl border border-slate-200 bg-white p-8">
          <h1 className="text-3xl font-semibold text-slate-950">Review unavailable</h1>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            This quiz has not been graded yet, so there is no review to show.
          </p>
          <PendingLink
            href="/quizzes"
            pendingLabel="Going back..."
            showLoader
            buttonStyle
            className="mt-6"
          >
            Back to quizzes
          </PendingLink>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell pathname="/quizzes" user={user}>
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="border border-slate-200 bg-white p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Review
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-slate-950">{data.quiz.title}</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">{data.quiz.description}</p>
          <p className="mt-4 text-sm text-slate-700">
            Final score: {data.submission.score}/{data.submission.maxScore}
          </p>
        </section>

        {(data.quiz.questions as ReviewQuestion[]).map((question) => {
          const answer = data.submission?.answers.find(
            (item: ReviewAnswer) => item.questionId === question._id.toString()
          );

          return (
            <section
              key={question._id.toString()}
              className="border border-slate-200 bg-white p-8"
            >
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="text-sm font-semibold text-slate-950">
                    {question.type === "code" ? "Code Question" : "Short Question"}
                  </p>
                  <div className="mt-3 text-sm text-slate-800">
                    <ReactMarkdown>{question.prompt}</ReactMarkdown>
                  </div>
                </div>
                <div className="border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  Marks: {answer?.awardedPoints || 0}/{question.points}
                </div>
              </div>

              {answer?.responseText && (
                <div className="mt-5 border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800 whitespace-pre-wrap">
                  {answer.responseText}
                </div>
              )}

              {answer?.code && (
                <pre className="mt-5 overflow-x-auto border border-slate-200 bg-slate-50 p-4 text-sm text-slate-950">
                  {answer.code}
                </pre>
              )}

              {answer?.feedback && (
                <div className="mt-5 border border-slate-200 bg-white p-4 text-sm text-slate-700">
                  Feedback: {answer.feedback}
                </div>
              )}
            </section>
          );
        })}

        {data.submission.feedback && (
          <section className="border border-slate-200 bg-white p-8">
            <h2 className="text-2xl font-semibold text-slate-950">Overall feedback</h2>
            <p className="mt-4 text-sm leading-7 text-slate-700">{data.submission.feedback}</p>
          </section>
        )}
      </div>
    </AppShell>
  );
}
