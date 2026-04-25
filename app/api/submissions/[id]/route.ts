import { NextRequest, NextResponse } from "next/server";
import { requireStudent } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongoose";
import { Submission, type SubmissionAnswer } from "@/lib/models/submission";
import { Quiz } from "@/lib/models/quiz";
import { hasQuizExpired } from "@/lib/quiz";
import { badRequest } from "@/lib/http";
import { serializeSubmission } from "@/lib/serializers";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireStudent();
  await connectToDatabase();
  const { id } = await params;
  const body = await request.json();

  const submission = await Submission.findById(id);
  if (!submission || submission.userId.toString() !== user.id) {
    return badRequest("Submission not found.", 404);
  }

  if (submission.status !== "in_progress") {
    return badRequest("This submission can no longer be edited.");
  }

  const quiz = await Quiz.findById(submission.quizId);
  if (!quiz) {
    return badRequest("Quiz not found.", 404);
  }

  if (hasQuizExpired(submission.startedAt, quiz.durationMinutes)) {
    return badRequest("Quiz time is over.", 410);
  }

  const answers = Array.isArray(body.answers) ? body.answers : [];

  const currentAnswers = submission.answers as unknown as SubmissionAnswer[];

  submission.answers = currentAnswers.map((answer) => {
    const incoming = answers.find(
      (item: { questionId?: string }) => item.questionId === answer.questionId
    );

    if (!incoming) {
      return answer as never;
    }

    return {
      ...answer,
      responseText: String(incoming.responseText || ""),
      selectedOption: String(incoming.selectedOption || ""),
      code: String(incoming.code || ""),
    };
  });

  await submission.save();

  return NextResponse.json({
    ok: true,
    submission: serializeSubmission(submission.toObject()),
  });
}
