import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongoose";
import { Quiz } from "@/lib/models/quiz";
import { badRequest } from "@/lib/http";
import { serializeQuiz } from "@/lib/serializers";

type IncomingQuestion = {
  prompt?: string;
  type?: string;
  points?: number;
  options?: string[];
  answer?: string;
  starterCode?: string;
  rubric?: string;
};

export async function POST(request: NextRequest) {
  await requireAdmin();
  await connectToDatabase();
  const body = await request.json();

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

  if (questions.length === 0) {
    return badRequest("Add at least one question.");
  }

  const normalizedQuestions = questions.map((question, index) => {
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

  const quiz = await Quiz.create({
    title,
    description,
    durationMinutes,
    attemptsAllowed,
    published,
    questions: normalizedQuestions,
  });

  return NextResponse.json({ ok: true, quiz: serializeQuiz(quiz.toObject()) });
}
