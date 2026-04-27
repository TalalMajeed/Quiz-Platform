import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { requireAdmin } from "@/lib/auth";
import { badRequest } from "@/lib/http";
import { Quiz } from "@/lib/models/quiz";
import { Submission } from "@/lib/models/submission";
import { connectToDatabase } from "@/lib/mongoose";
import { serializeQuiz } from "@/lib/serializers";

type IncomingQuestion = {
  prompt?: string;
  type?: string;
  points?: number;
  answer?: string;
  starterCode?: string;
  rubric?: string;
};

function normalizeQuestions(questions: IncomingQuestion[]) {
  if (questions.length === 0) {
    throw new Error("Add at least one question.");
  }

  return questions.map((question, index) => {
    const prompt = String(question.prompt || "").trim();
    const type = String(question.type || "").trim();
    const points = Number(question.points || 0);

    if (!prompt) {
      throw new Error(`Question ${index + 1} needs a prompt.`);
    }

    if (!["short", "code"].includes(type)) {
      throw new Error(`Question ${index + 1} has an invalid type.`);
    }

    if (!Number.isFinite(points) || points < 1) {
      throw new Error(`Question ${index + 1} needs at least 1 point.`);
    }

    return {
      prompt,
      type,
      points,
      options: undefined,
      answer: String(question.answer || "").trim(),
      starterCode: String(question.starterCode || ""),
      rubric: String(question.rubric || "").trim(),
    };
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();
  await connectToDatabase();
  const { id } = await params;
  const body = await request.json();

  if (!Types.ObjectId.isValid(id)) {
    return badRequest("Quiz not found.", 404);
  }

  const quiz = await Quiz.findById(id);
  if (!quiz) {
    return badRequest("Quiz not found.", 404);
  }

  const title = String(body.title || "").trim();
  const description = String(body.description || "").trim();
  const durationMinutes = Number(body.durationMinutes || 0);
  const attemptsAllowed = Number(body.attemptsAllowed || 0);
  const published = Boolean(body.published ?? true);
  const questions = Array.isArray(body.questions) ? (body.questions as IncomingQuestion[]) : [];

  if (!title) {
    return badRequest("Quiz title is required.");
  }

  if (!Number.isFinite(durationMinutes) || durationMinutes < 1) {
    return badRequest("Duration must be at least 1 minute.");
  }

  if (!Number.isFinite(attemptsAllowed) || attemptsAllowed < 1) {
    return badRequest("Attempts allowed must be at least 1.");
  }

  try {
    quiz.title = title;
    quiz.description = description;
    quiz.durationMinutes = durationMinutes;
    quiz.attemptsAllowed = attemptsAllowed;
    quiz.published = published;
    quiz.questions = normalizeQuestions(questions);
    await quiz.save();
  } catch (error) {
    return badRequest(
      error instanceof Error ? error.message : "Unable to update quiz."
    );
  }

  return NextResponse.json({ ok: true, quiz: serializeQuiz(quiz.toObject()) });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();
  await connectToDatabase();
  const { id } = await params;

  if (!Types.ObjectId.isValid(id)) {
    return badRequest("Quiz not found.", 404);
  }

  const quiz = await Quiz.findByIdAndDelete(id);
  if (!quiz) {
    return badRequest("Quiz not found.", 404);
  }

  await Submission.deleteMany({ quizId: quiz._id });

  return NextResponse.json({ ok: true });
}
