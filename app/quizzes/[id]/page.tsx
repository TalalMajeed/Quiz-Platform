import { notFound } from "next/navigation";
import { QuizAttempt } from "@/components/student/quiz-attempt";
import { requireStudent } from "@/lib/auth";
import { getQuizAttemptData } from "@/lib/data";
import { serializeQuiz, serializeSubmission } from "@/lib/serializers";

export default async function QuizAttemptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireStudent(`/quizzes/${id}`);
  const data = await getQuizAttemptData(id, user.id);

  if (!data) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white px-10 py-10">
      <QuizAttempt
        quiz={serializeQuiz(data.quiz.toObject())}
        attemptsUsed={data.attemptsUsed}
        initialSubmission={serializeSubmission(
          data.submission ? data.submission.toObject() : null
        )}
      />
    </div>
  );
}
