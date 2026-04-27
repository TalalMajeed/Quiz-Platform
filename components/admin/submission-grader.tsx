"use client";

import { FormEvent, startTransition, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type SubmissionRecord = {
  id: string;
  status: string;
  score: number;
  maxScore: number;
  feedback: string;
  submittedAt: string;
  quizTitle: string;
  studentName: string;
  studentEmail: string;
  studentUsername: string;
  answers: Array<{
    questionId: string;
    prompt: string;
    points: number;
    type: "short" | "code";
    responseText: string;
    selectedOption: string;
    code: string;
    awardedPoints: number;
    autoAwardedPoints: number;
    feedback: string;
  }>;
};

type SubmissionGraderProps = {
  submissions: SubmissionRecord[];
};

const fieldClass =
  "w-full border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-950";

export function SubmissionGrader({ submissions }: SubmissionGraderProps) {
  const router = useRouter();
  const initialSubmission = submissions[0];
  const [items, setItems] = useState(submissions);
  const [message, setMessage] = useState("");
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(
    initialSubmission?.id || ""
  );
  const [gradingFeedback, setGradingFeedback] = useState(
    initialSubmission?.feedback || ""
  );
  const [gradingAnswers, setGradingAnswers] = useState<
    Record<string, { awardedPoints: number; feedback: string }>
  >(
    Object.fromEntries(
      (initialSubmission?.answers || []).map((answer) => [
        answer.questionId,
        {
          awardedPoints: answer.awardedPoints,
          feedback: answer.feedback,
        },
      ])
    )
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const selectedSubmission = items.find(
    (submission) => submission.id === selectedSubmissionId
  );

  function syncSelectedSubmission(submissionId: string, list = items) {
    const current = list.find((submission) => submission.id === submissionId);
    setSelectedSubmissionId(current?.id || "");
    setGradingFeedback(current?.feedback || "");
    setGradingAnswers(
      Object.fromEntries(
        (current?.answers || []).map((answer) => [
          answer.questionId,
          {
            awardedPoints: answer.awardedPoints,
            feedback: answer.feedback,
          },
        ])
      )
    );
  }

  async function handleGradeSubmission(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedSubmission) {
      return;
    }

    setIsSaving(true);
    setMessage("Saving grades...");

    const response = await fetch(
      `/api/admin/submissions/${selectedSubmission.id}/grade`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          feedback: gradingFeedback,
          answers: selectedSubmission.answers.map((answer) => ({
            questionId: answer.questionId,
            awardedPoints: gradingAnswers[answer.questionId]?.awardedPoints || 0,
            feedback: gradingAnswers[answer.questionId]?.feedback || "",
          })),
        }),
      }
    );

    const payload = await response.json();
    setIsSaving(false);

    if (!response.ok) {
      setMessage(payload.error || "Unable to save grades.");
      return;
    }

    const nextSubmission = payload.submission as {
      id: string;
      status: string;
      score: number;
      maxScore: number;
      feedback: string;
      answers: SubmissionRecord["answers"];
    };

    setItems((current) =>
      current.map((submission) =>
        submission.id === selectedSubmission.id
          ? {
              ...submission,
              status: nextSubmission.status,
              score: nextSubmission.score,
              maxScore: nextSubmission.maxScore,
              feedback: nextSubmission.feedback,
              answers: nextSubmission.answers,
            }
          : submission
      )
    );
    setGradingFeedback(nextSubmission.feedback || "");
    setGradingAnswers(
      Object.fromEntries(
        nextSubmission.answers.map((answer) => [
          answer.questionId,
          {
            awardedPoints: answer.awardedPoints,
            feedback: answer.feedback,
          },
        ])
      )
    );

    setMessage("Submission updated.");
    startTransition(() => {
      router.refresh();
    });
  }

  async function handleDeleteSubmission() {
    if (!selectedSubmission) {
      return;
    }

    const confirmed = window.confirm(
      `Delete ${selectedSubmission.studentName}'s submission for ${selectedSubmission.quizTitle}?`
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setMessage("Deleting submission...");

    const response = await fetch(`/api/admin/submissions/${selectedSubmission.id}`, {
      method: "DELETE",
    });
    const payload = await response.json().catch(() => ({}));
    setIsDeleting(false);

    if (!response.ok) {
      setMessage(payload.error || "Unable to delete submission.");
      return;
    }

    const nextItems = items.filter(
      (submission) => submission.id !== selectedSubmission.id
    );
    setItems(nextItems);
    syncSelectedSubmission(nextItems[0]?.id || "", nextItems);
    setMessage("Submission deleted.");
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleGradeSubmission} className="border border-slate-200 bg-white p-8">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-2xl font-semibold text-slate-950">Grade Submissions</h3>
        <select
          value={selectedSubmissionId}
          onChange={(event) => syncSelectedSubmission(event.target.value)}
          className="border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none"
        >
          {items.map((submission) => (
            <option key={submission.id} value={submission.id}>
              {submission.studentName} • {submission.quizTitle}
            </option>
          ))}
        </select>
      </div>

      {selectedSubmission ? (
        <div className="mt-6 space-y-5">
          <div className="border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
            <p>{selectedSubmission.studentName}</p>
            <p className="mt-1">
              {selectedSubmission.studentEmail || selectedSubmission.studentUsername}
            </p>
            <p className="mt-1">
              Status: {selectedSubmission.status} • Current score:{" "}
              {selectedSubmission.score}/{selectedSubmission.maxScore}
            </p>
            {selectedSubmission.submittedAt && (
              <p className="mt-1">
                Submitted: {new Date(selectedSubmission.submittedAt).toLocaleString()}
              </p>
            )}
          </div>

          {selectedSubmission.answers.map((answer, index) => (
            <div key={answer.questionId} className="border border-slate-200 bg-white p-5">
              <p className="text-sm font-semibold text-slate-950">Question {index + 1}</p>
              <div className="mt-3 border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800">
                <ReactMarkdown>{answer.prompt}</ReactMarkdown>
              </div>
              <p className="mt-3 text-sm text-slate-600">
                Type: {answer.type} • Total marks: {answer.points}
              </p>
              {answer.selectedOption && (
                <p className="mt-3 text-sm text-slate-700">
                  Selected option: {answer.selectedOption}
                </p>
              )}
              {answer.responseText && (
                <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">
                  {answer.responseText}
                </p>
              )}
              {answer.code && (
                <pre className="mt-3 overflow-x-auto border border-slate-200 bg-slate-50 p-4 text-sm text-slate-950">
                  {answer.code}
                </pre>
              )}
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <input
                  type="number"
                  min={0}
                  max={answer.points}
                  value={gradingAnswers[answer.questionId]?.awardedPoints || 0}
                  onChange={(event) =>
                    setGradingAnswers((current) => ({
                      ...current,
                      [answer.questionId]: {
                        ...current[answer.questionId],
                        awardedPoints: Math.min(
                          answer.points,
                          Math.max(0, Number(event.target.value))
                        ),
                      },
                    }))
                  }
                  className={fieldClass}
                />
                <input
                  value={gradingAnswers[answer.questionId]?.feedback || ""}
                  onChange={(event) =>
                    setGradingAnswers((current) => ({
                      ...current,
                      [answer.questionId]: {
                        ...current[answer.questionId],
                        feedback: event.target.value,
                      },
                    }))
                  }
                  placeholder="Feedback"
                  className={fieldClass}
                />
              </div>
            </div>
          ))}

          <textarea
            value={gradingFeedback}
            onChange={(event) => setGradingFeedback(event.target.value)}
            placeholder="Overall feedback"
            className={`${fieldClass} min-h-28`}
          />

          <div className="flex items-center gap-3">
            <Button
              type="submit"
              isLoading={isSaving}
              loadingLabel="Saving grades..."
            >
              Save Grades
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={() => void handleDeleteSubmission()}
              isLoading={isDeleting}
              loadingLabel="Deleting..."
            >
              Delete Submission
            </Button>
          </div>

          {message && <p className="text-sm text-slate-700">{message}</p>}
        </div>
      ) : (
        <p className="mt-6 text-sm text-slate-500">
          No completed submissions are ready for grading yet.
        </p>
      )}
    </form>
  );
}
