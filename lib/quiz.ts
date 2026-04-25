import { Types } from "mongoose";
import {
  Quiz,
  type QuestionDocument,
  type QuizDocument,
} from "@/lib/models/quiz";
import { Submission } from "@/lib/models/submission";
import { connectToDatabase } from "@/lib/mongoose";

export type NormalizedAnswer = {
  questionId: string;
  responseText?: string;
  selectedOption?: string;
  code?: string;
};

export function getQuizMaxScore(quiz: QuizDocument) {
  return quiz.questions.reduce((sum, question) => sum + question.points, 0);
}

export function gradeAutoAnswers(quiz: QuizDocument, answers: NormalizedAnswer[]) {
  let total = 0;

  const graded = quiz.questions.map((question) => {
    const answer = answers.find(
      (candidate) => candidate.questionId === question._id.toString()
    );

    let autoAwardedPoints = 0;
    if (question.type === "short") {
      autoAwardedPoints =
        answer?.responseText?.trim().toLowerCase() ===
        question.answer.trim().toLowerCase()
          ? question.points
          : 0;
    }

    total += autoAwardedPoints;

    return {
      questionId: question._id.toString(),
      responseText: answer?.responseText || "",
      selectedOption: answer?.selectedOption || "",
      code: answer?.code || "",
      autoAwardedPoints,
      awardedPoints: question.type === "code" ? 0 : autoAwardedPoints,
      feedback: "",
    };
  });

  return {
    answers: graded,
    autoScore: total,
    score: graded.reduce((sum, item) => sum + item.awardedPoints, 0),
  };
}

export function getQuizDeadline(startedAt: Date, durationMinutes: number) {
  return new Date(startedAt.getTime() + durationMinutes * 60 * 1000);
}

export function hasQuizExpired(startedAt: Date, durationMinutes: number) {
  return Date.now() >= getQuizDeadline(startedAt, durationMinutes).getTime();
}

export async function ensureActiveSubmission(
  quizId: string,
  userId: string
) {
  await connectToDatabase();

  const quiz = await Quiz.findById(quizId);
  if (!quiz || !quiz.published) {
    return null;
  }

  const attemptsUsed = await Submission.countDocuments({
    quizId: new Types.ObjectId(quizId),
    userId: new Types.ObjectId(userId),
    status: { $in: ["submitted", "graded", "expired"] },
  });

  if (attemptsUsed >= quiz.attemptsAllowed) {
    return "limit_reached" as const;
  }

  let submission = await Submission.findOne({
    quizId: new Types.ObjectId(quizId),
    userId: new Types.ObjectId(userId),
    status: "in_progress",
  });

  if (submission) {
    if (hasQuizExpired(submission.startedAt, quiz.durationMinutes)) {
      const graded = gradeAutoAnswers(quiz.toObject(), submission.answers);
      submission.answers = graded.answers;
      submission.autoScore = graded.autoScore;
      submission.score = graded.score;
      submission.maxScore = getQuizMaxScore(quiz.toObject());
      submission.status = "expired";
      submission.submittedAt = new Date();
      await submission.save();
    } else {
      return submission;
    }
  }

  submission = await Submission.create({
    quizId: quiz._id,
    userId: new Types.ObjectId(userId),
    answers: quiz.questions.map((question: QuestionDocument) => ({
      questionId: question._id.toString(),
      responseText: "",
      selectedOption: "",
      code: question.starterCode || "",
      autoAwardedPoints: 0,
      awardedPoints: 0,
      feedback: "",
    })),
    status: "in_progress",
    startedAt: new Date(),
    maxScore: getQuizMaxScore(quiz.toObject()),
  });

  return submission;
}
