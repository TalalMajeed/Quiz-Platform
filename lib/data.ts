import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/mongoose";
import { Quiz } from "@/lib/models/quiz";
import { Submission } from "@/lib/models/submission";
import type { SubmissionAnswer } from "@/lib/models/submission";
import { User } from "@/lib/models/user";

export async function getStudentDashboard(userId: string) {
  await connectToDatabase();

  const quizzes = await Quiz.find({ published: true }).sort({ createdAt: -1 }).lean();
  const submissions = await Submission.find({
    userId: new Types.ObjectId(userId),
  })
    .sort({ updatedAt: -1 })
    .lean();

  return quizzes.map((quiz) => {
    const matching = submissions.filter(
      (submission) => submission.quizId.toString() === quiz._id.toString()
    );
    const latest = matching[0];

    return {
      id: quiz._id.toString(),
      title: quiz.title,
      description: quiz.description,
      durationMinutes: quiz.durationMinutes,
      attemptsAllowed: quiz.attemptsAllowed,
      questionCount: quiz.questions.length,
      attemptsUsed: matching.filter((submission) => submission.status !== "in_progress").length,
      submission: latest
        ? {
            id: latest._id.toString(),
            status: latest.status,
            score: latest.status === "graded" ? latest.score : null,
            maxScore: latest.status === "graded" ? latest.maxScore : null,
            submittedAt:
              latest.submittedAt instanceof Date
                ? latest.submittedAt.toISOString()
                : "",
          }
        : null,
    };
  });
}

export async function getQuizAttemptData(quizId: string, userId: string) {
  await connectToDatabase();

  const quiz = await Quiz.findById(quizId);
  if (!quiz || !quiz.published) {
    return null;
  }

  const submission = await Submission.findOne({
    quizId: quiz._id,
    userId: new Types.ObjectId(userId),
  }).sort({ createdAt: -1 });

  const attemptsUsed = await Submission.countDocuments({
    quizId: quiz._id,
    userId: new Types.ObjectId(userId),
    status: { $in: ["submitted", "graded", "expired"] },
  });

  return { quiz, submission, attemptsUsed };
}

export async function getAdminDashboardData() {
  await connectToDatabase();

  const [quizzes, students, submissions] = await Promise.all([
    Quiz.find().sort({ createdAt: -1 }).lean(),
    User.find({ role: "student" }).sort({ createdAt: -1 }).lean(),
    Submission.find({
      status: { $in: ["submitted", "graded", "expired"] },
    })
      .populate("quizId", "title questions")
      .populate("userId", "name email username")
      .sort({ updatedAt: -1 })
      .lean(),
  ]);

  return {
    quizzes: quizzes.map((quiz) => ({
      id: quiz._id.toString(),
      title: quiz.title,
      description: quiz.description,
      durationMinutes: quiz.durationMinutes,
      attemptsAllowed: quiz.attemptsAllowed,
      published: quiz.published,
      questionCount: quiz.questions.length,
      questions: (
        quiz.questions as Array<{
          _id: Types.ObjectId;
          prompt: string;
          type: "short" | "code";
          points: number;
          answer?: string;
          starterCode?: string;
          rubric?: string;
        }>
      ).map((question) => ({
        id: question._id.toString(),
        prompt: question.prompt,
        type: question.type,
        points: question.points,
        answer: question.answer || "",
        starterCode: question.starterCode || "",
        rubric: question.rubric || "",
      })),
      createdAt:
        quiz.createdAt instanceof Date ? quiz.createdAt.toISOString() : "",
    })),
    students: students.map((student) => ({
      id: student._id.toString(),
      name: student.name,
      email: student.email || "",
      username: student.username || "",
      createdAt:
        student.createdAt instanceof Date ? student.createdAt.toISOString() : "",
    })),
    submissions: submissions.map((submission) => {
      const quiz = submission.quizId as {
        _id: Types.ObjectId;
        title: string;
        questions?: Array<{
          _id: Types.ObjectId;
          prompt: string;
          type: "short" | "code";
          points: number;
        }>;
      } | null;
      const student = submission.userId as {
        _id: Types.ObjectId;
        name: string;
        email?: string;
        username?: string;
      } | null;

      return {
        id: submission._id.toString(),
        status: submission.status,
        score: submission.score,
        maxScore: submission.maxScore,
        feedback: submission.feedback,
        submittedAt:
          submission.submittedAt instanceof Date
            ? submission.submittedAt.toISOString()
            : "",
        quizTitle: quiz?.title || "Unknown Quiz",
        studentName: student?.name || "Unknown Student",
        studentEmail: student?.email || "",
        studentUsername: student?.username || "",
        answers: (submission.answers as SubmissionAnswer[]).map((answer) => ({
          questionId: answer.questionId,
          prompt:
            quiz?.questions?.find(
              (question) => question._id.toString() === answer.questionId
            )?.prompt || "",
          points:
            quiz?.questions?.find(
              (question) => question._id.toString() === answer.questionId
            )?.points || 0,
          type:
            quiz?.questions?.find(
              (question) => question._id.toString() === answer.questionId
            )?.type || "short",
          responseText: answer.responseText || "",
          selectedOption: answer.selectedOption || "",
          code: answer.code || "",
          awardedPoints: answer.awardedPoints || 0,
          autoAwardedPoints: answer.autoAwardedPoints || 0,
          feedback: answer.feedback || "",
        })),
      };
    }),
  };
}

export async function getStudentReviewData(quizId: string, userId: string) {
  await connectToDatabase();

  const quiz = await Quiz.findById(quizId).lean();
  if (!quiz || !quiz.published) {
    return null;
  }

  const submission = await Submission.findOne({
    quizId: quiz._id,
    userId: new Types.ObjectId(userId),
    status: "graded",
  })
    .sort({ updatedAt: -1 })
    .lean();

  if (!submission) {
    return { quiz, submission: null };
  }

  return { quiz, submission };
}
