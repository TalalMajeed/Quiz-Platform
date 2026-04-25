import type { QuizDocument } from "@/lib/models/quiz";
import type {
  SubmissionAnswer,
  SubmissionDocument,
} from "@/lib/models/submission";

export function serializeQuiz(quiz: QuizDocument) {
  return {
    id: quiz._id.toString(),
    title: quiz.title,
    description: quiz.description,
    durationMinutes: quiz.durationMinutes,
    attemptsAllowed: quiz.attemptsAllowed,
    published: quiz.published,
    createdAt: quiz.createdAt instanceof Date ? quiz.createdAt.toISOString() : "",
    questions: quiz.questions.map((question) => ({
      id: question._id.toString(),
      prompt: question.prompt,
      type: question.type,
      points: question.points,
      options: question.options || [],
      starterCode: question.starterCode || "",
      rubric: question.rubric || "",
    })),
  };
}

export function serializeSubmission(submission: SubmissionDocument | null) {
  if (!submission) {
    return null;
  }

  return {
    id: submission._id.toString(),
    status: submission.status,
    startedAt:
      submission.startedAt instanceof Date
        ? submission.startedAt.toISOString()
        : "",
    submittedAt:
      submission.submittedAt instanceof Date
        ? submission.submittedAt.toISOString()
        : "",
    gradedAt:
      submission.gradedAt instanceof Date ? submission.gradedAt.toISOString() : "",
    autoScore: submission.autoScore,
    score: submission.score,
    maxScore: submission.maxScore,
    feedback: submission.feedback,
    answers: (submission.answers as SubmissionAnswer[]).map((answer) => ({
      questionId: answer.questionId,
      responseText: answer.responseText || "",
      selectedOption: answer.selectedOption || "",
      code: answer.code || "",
      awardedPoints: answer.awardedPoints || 0,
      autoAwardedPoints: answer.autoAwardedPoints || 0,
      feedback: answer.feedback || "",
    })),
  };
}
