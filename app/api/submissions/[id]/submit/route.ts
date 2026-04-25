import { NextRequest, NextResponse } from "next/server";
import { requireStudent } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongoose";
import { Submission } from "@/lib/models/submission";
import { Quiz } from "@/lib/models/quiz";
import { badRequest } from "@/lib/http";
import { gradeAutoAnswers, getQuizMaxScore } from "@/lib/quiz";
import { serializeSubmission } from "@/lib/serializers";

export async function POST(
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

  const quiz = await Quiz.findById(submission.quizId);
  if (!quiz) {
    return badRequest("Quiz not found.", 404);
  }

  const answers = Array.isArray(body.answers) ? body.answers : [];
  const graded = gradeAutoAnswers(quiz.toObject(), answers);

  submission.answers = graded.answers;
  submission.autoScore = graded.autoScore;
  submission.score = graded.score;
  submission.maxScore = getQuizMaxScore(quiz.toObject());
  submission.status = "submitted";
  submission.submittedAt = new Date();
  await submission.save();

  return NextResponse.json({
    ok: true,
    submission: serializeSubmission(submission.toObject()),
  });
}
