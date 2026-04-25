import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { requireAdmin } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongoose";
import { Submission, type SubmissionAnswer } from "@/lib/models/submission";
import { Quiz, type QuestionDocument } from "@/lib/models/quiz";
import { badRequest } from "@/lib/http";
import { serializeSubmission } from "@/lib/serializers";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  await connectToDatabase();
  const { id } = await params;
  const body = await request.json();

  const submission = await Submission.findById(id);
  if (!submission) {
    return badRequest("Submission not found.", 404);
  }

  const quiz = await Quiz.findById(submission.quizId);
  if (!quiz) {
    return badRequest("Quiz not found.", 404);
  }

  const updates = Array.isArray(body.answers) ? body.answers : [];
  const feedback = String(body.feedback || "");

  const currentAnswers = submission.answers as unknown as SubmissionAnswer[];

  submission.answers = currentAnswers.map((answer) => {
    const question = quiz.questions.find(
      (item: QuestionDocument) => item._id.toString() === answer.questionId
    );
    const incoming = updates.find(
      (item: { questionId?: string }) => item.questionId === answer.questionId
    );

    if (!question || !incoming) {
      return answer as never;
    }

    const awardedPoints = Math.max(
      0,
      Math.min(Number(incoming.awardedPoints || 0), question.points)
    );

    return {
      ...answer,
      awardedPoints,
      feedback: String(incoming.feedback || ""),
    };
  });

  submission.feedback = feedback;
  const gradedAnswers = submission.answers as unknown as SubmissionAnswer[];
  submission.score = gradedAnswers.reduce(
    (sum: number, answer: SubmissionAnswer) => sum + (answer.awardedPoints || 0),
    0
  );
  submission.status = "graded";
  submission.gradedAt = new Date();
  submission.gradedBy = new Types.ObjectId(admin.id);
  await submission.save();

  return NextResponse.json({
    ok: true,
    submission: serializeSubmission(submission.toObject()),
  });
}
