"use client";

import ReactMarkdown from "react-markdown";
import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { PendingLink } from "@/components/ui/pending-link";

declare global {
  interface Window {
    Sk?: {
      configure: (config: {
        output: (text: string) => void;
        read: (name: string) => string;
      }) => void;
      builtinFiles?: {
        files?: Record<string, string>;
      };
      importMainWithBody: (
        filename: string,
        canSuspend: boolean,
        code: string,
        returnNone?: boolean
      ) => Promise<unknown>;
    };
  }
}

type QuizAttemptProps = {
  quiz: {
    id: string;
    title: string;
    description: string;
    durationMinutes: number;
    attemptsAllowed: number;
    questions: Array<{
      id: string;
      prompt: string;
      type: "short" | "code";
      points: number;
      starterCode: string;
      rubric: string;
    }>;
  };
  attemptsUsed: number;
  initialSubmission: {
    id: string;
    status: string;
    startedAt: string;
    submittedAt: string;
    autoScore: number;
    score: number;
    maxScore: number;
    feedback: string;
    answers: Array<{
      questionId: string;
      responseText: string;
      selectedOption: string;
      code: string;
      awardedPoints: number;
      autoAwardedPoints: number;
      feedback: string;
    }>;
  } | null;
};

type AnswerState = Record<
  string,
  { responseText: string; selectedOption: string; code: string }
>;

const fieldClass =
  "w-full border border-slate-300 bg-white px-4 py-4 text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-950";

function getSkulptErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }

  if (typeof error === "string" && error.trim()) {
    return error.trim();
  }

  if (error && typeof error === "object") {
    const candidate = error as {
      toString?: () => string;
      tp$str?: () => { v?: string; toString?: () => string };
      args?: { v?: unknown[] };
      traceback?: Array<{ lineno?: number; colno?: number }>;
    };

    const tpString = candidate.tp$str?.();
    if (typeof tpString?.v === "string" && tpString.v.trim()) {
      return tpString.v.trim();
    }

    const argsValue = candidate.args?.v?.[0];
    if (typeof argsValue === "string" && argsValue.trim()) {
      return argsValue.trim();
    }

    const rendered = candidate.toString?.();
    if (typeof rendered === "string" && rendered.trim() && rendered !== "[object Object]") {
      return rendered.trim();
    }

    const location = candidate.traceback?.[0];
    if (location?.lineno) {
      return `Python error near line ${location.lineno}${location.colno ? `, column ${location.colno}` : ""}.`;
    }
  }

  return "Execution failed.";
}

export function QuizAttempt({
  quiz,
  attemptsUsed,
  initialSubmission,
}: QuizAttemptProps) {
  const autosaveRef = useRef<NodeJS.Timeout | null>(null);
  const [submission, setSubmission] = useState(initialSubmission);
  const [answers, setAnswers] = useState<AnswerState>(() =>
    Object.fromEntries(
      quiz.questions.map((question) => {
        const answer = initialSubmission?.answers.find(
          (item) => item.questionId === question.id
        );
        return [
          question.id,
          {
            responseText: answer?.responseText || "",
            selectedOption: answer?.selectedOption || "",
            code: answer?.code || question.starterCode || "",
          },
        ];
      })
    )
  );
  const [remainingSeconds, setRemainingSeconds] = useState(quiz.durationMinutes * 60);
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [runningQuestionId, setRunningQuestionId] = useState("");
  const [pythonOutput, setPythonOutput] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCompletionScreen, setShowCompletionScreen] = useState(false);

  const latestStatus = submission?.status || "";
  const isInProgress = latestStatus === "in_progress";
  const activeQuestion = quiz.questions[currentIndex];
  const attemptsRemaining = Math.max(0, quiz.attemptsAllowed - attemptsUsed);

  async function startQuiz() {
    setStatusMessage("");
    setIsStarting(true);
    const response = await fetch(`/api/quizzes/${quiz.id}/start`, {
      method: "POST",
    });
    const data = await response.json();
    setIsStarting(false);

    if (!response.ok) {
      setStatusMessage(data.error || "Unable to start this quiz.");
      return;
    }

    setSubmission(data.submission);
    setCurrentIndex(0);
  }

  const saveAnswers = async (nextAnswers = answers) => {
    if (!submission || !isInProgress) {
      return;
    }

    const response = await fetch(`/api/submissions/${submission.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        answers: Object.entries(nextAnswers).map(([questionId, value]) => ({
          questionId,
          ...value,
        })),
      }),
    });

    if (response.ok) {
      setStatusMessage("Progress saved.");
    }
  };

  const scheduleSave = (nextAnswers: typeof answers) => {
    if (autosaveRef.current) {
      clearTimeout(autosaveRef.current);
    }

    autosaveRef.current = setTimeout(() => {
      void saveAnswers(nextAnswers);
    }, 500);
  };

  function updateAnswer(
    questionId: string,
    key: "responseText" | "selectedOption" | "code",
    value: string
  ) {
    const nextAnswers = {
      ...answers,
      [questionId]: {
        ...answers[questionId],
        [key]: value,
      },
    };

    setAnswers(nextAnswers);
    setStatusMessage("Saving...");
    scheduleSave(nextAnswers);
  }

  async function handleSubmit() {
    if (!submission || isSubmitting || !isInProgress) {
      return;
    }

    setIsSubmitting(true);
    const response = await fetch(`/api/submissions/${submission.id}/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        answers: Object.entries(answers).map(([questionId, value]) => ({
          questionId,
          ...value,
        })),
      }),
    });

    const data = await response.json();
    setIsSubmitting(false);

    if (!response.ok) {
      setStatusMessage(data.error || "Unable to submit right now.");
      return;
    }

    setSubmission(data.submission);
    setStatusMessage("Quiz submitted.");
    setShowCompletionScreen(true);
  }

  const handleAutoSubmit = useEffectEvent(() => {
    void handleSubmit();
  });

  useEffect(() => {
    if (!submission?.startedAt || !isInProgress) {
      return;
    }

    const deadline =
      new Date(submission.startedAt).getTime() + quiz.durationMinutes * 60 * 1000;

    const tick = () => {
      const seconds = Math.max(0, Math.floor((deadline - Date.now()) / 1000));
      setRemainingSeconds(seconds);

      if (seconds === 0) {
        handleAutoSubmit();
      }
    };

    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [isInProgress, quiz.durationMinutes, submission?.startedAt]);

  async function runCode(questionId: string) {
    const source = answers[questionId]?.code || "";
    const sk = window.Sk;
    setRunningQuestionId(questionId);

    if (!sk) {
      setPythonOutput((current) => ({
        ...current,
        [questionId]: "Skulpt is still loading. Try again in a moment.",
      }));
      setRunningQuestionId("");
      return;
    }

    try {
      let output = "";
      sk.configure({
        output: (text: string) => {
          output += text;
        },
        read: (name: string) => {
          if (!sk.builtinFiles?.files?.[name]) {
            throw new Error(`File not found: ${name}`);
          }
          return sk.builtinFiles.files[name];
        },
      });

      await sk.importMainWithBody("<stdin>", false, source, true);
      setPythonOutput((current) => ({
        ...current,
        [questionId]: output || "Program executed with no output.",
      }));
    } catch (error) {
      setPythonOutput((current) => ({
        ...current,
        [questionId]: getSkulptErrorMessage(error),
      }));
    } finally {
      setRunningQuestionId("");
    }
  }

  const clock = useMemo(() => {
    const minutes = String(Math.floor(remainingSeconds / 60)).padStart(2, "0");
    const seconds = String(remainingSeconds % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  }, [remainingSeconds]);

  if (!isInProgress && !showCompletionScreen && attemptsRemaining > 0) {
    return (
      <div className="mx-auto max-w-5xl border border-slate-200 bg-white p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
          Quiz Details
        </p>
        <h1 className="mt-4 text-4xl font-semibold text-slate-950">{quiz.title}</h1>
        <p className="mt-4 text-base leading-8 text-slate-600">{quiz.description}</p>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <div className="border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Time</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">
              {quiz.durationMinutes} min
            </p>
          </div>
          <div className="border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Questions</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">
              {quiz.questions.length}
            </p>
          </div>
          <div className="border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Attempts Allowed</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">
              {quiz.attemptsAllowed}
            </p>
          </div>
          <div className="border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Attempts Remaining</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">
              {attemptsRemaining}
            </p>
          </div>
        </div>

        <div className="mt-8 flex items-center gap-4">
          <Button
            type="button"
            onClick={() => void startQuiz()}
            isLoading={isStarting}
            loadingLabel="Starting..."
            size="lg"
          >
            Start Quiz
          </Button>
          <PendingLink href="/quizzes" className="text-sm font-medium text-slate-700">
            Back to home
          </PendingLink>
        </div>

        {statusMessage && <p className="mt-4 text-sm text-slate-700">{statusMessage}</p>}
      </div>
    );
  }

  if (!isInProgress && !showCompletionScreen && attemptsRemaining === 0) {
    return (
      <div className="mx-auto max-w-4xl border border-slate-200 bg-white p-10">
        <h1 className="text-3xl font-semibold text-slate-950">No attempts remaining</h1>
        <p className="mt-4 text-slate-600">
          You have already used all allowed attempts for this quiz.
        </p>
        <PendingLink
          href="/quizzes"
          pendingLabel="Going back..."
          showLoader
          buttonStyle
          className="mt-8"
        >
          Back to home
        </PendingLink>
      </div>
    );
  }

  if (showCompletionScreen) {
    return (
      <div className="mx-auto max-w-4xl border border-slate-200 bg-white p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
          Finished
        </p>
        <h1 className="mt-4 text-4xl font-semibold text-slate-950">
          Quiz completed
        </h1>
        <p className="mt-4 text-base leading-8 text-slate-600">
          Your attempt has been submitted. Results will appear only after the admin grades
          the quiz.
        </p>
        <PendingLink
          href="/quizzes"
          pendingLabel="Going back..."
          showLoader
          buttonStyle
          className="mt-8"
        >
          Back to home
        </PendingLink>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="border border-slate-200 bg-white p-8">
        <div className="flex items-start justify-between gap-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              Quiz In Progress
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950">{quiz.title}</h1>
            <p className="mt-2 text-sm text-slate-600">
              Question {currentIndex + 1} of {quiz.questions.length}
            </p>
          </div>
          <div className="border border-slate-200 bg-slate-50 px-5 py-4 text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              Time Left
            </p>
            <p className="mt-2 text-3xl font-semibold text-slate-950">{clock}</p>
            <p className="mt-2 text-xs text-slate-600">{statusMessage}</p>
          </div>
        </div>
      </div>

      <section className="border border-slate-200 bg-white p-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              {activeQuestion.type === "code" ? "Code Question" : "Short Question"}
            </p>
            <div className="mt-3 prose prose-slate max-w-none text-slate-950">
              <ReactMarkdown>{activeQuestion.prompt}</ReactMarkdown>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              {activeQuestion.points} points
            </p>
          </div>
        </div>

        {activeQuestion.type === "short" && (
          <textarea
            value={answers[activeQuestion.id]?.responseText || ""}
            onChange={(event) =>
              updateAnswer(activeQuestion.id, "responseText", event.target.value)
            }
            className={`${fieldClass} mt-6 min-h-48`}
            placeholder="Write your answer here"
          />
        )}

        {activeQuestion.type === "code" && (
          <div className="mt-6 grid gap-4">
            {activeQuestion.rubric && (
              <div className="border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                {activeQuestion.rubric}
              </div>
            )}
            <textarea
              value={answers[activeQuestion.id]?.code || ""}
              onChange={(event) => updateAnswer(activeQuestion.id, "code", event.target.value)}
              className={`${fieldClass} min-h-80 font-mono text-sm`}
              spellCheck={false}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => void runCode(activeQuestion.id)}
              isLoading={runningQuestionId === activeQuestion.id}
              loadingLabel="Running..."
              className="w-fit"
            >
              Run Code
            </Button>
            <pre className="min-h-28 border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-950">
              {pythonOutput[activeQuestion.id] || "Output will appear here."}
            </pre>
          </div>
        )}
      </section>

      <div className="flex items-center justify-between border border-slate-200 bg-white p-6">
        <Button
          type="button"
          onClick={() => setCurrentIndex((current) => Math.max(0, current - 1))}
          disabled={currentIndex === 0}
          variant="secondary"
        >
          Back
        </Button>

        <div className="flex items-center gap-3">
          {currentIndex < quiz.questions.length - 1 ? (
            <Button
              type="button"
              onClick={() =>
                setCurrentIndex((current) =>
                  Math.min(quiz.questions.length - 1, current + 1)
                )
              }
            >
              Next
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => void handleSubmit()}
              isLoading={isSubmitting}
              loadingLabel="Submitting..."
            >
              Finish Quiz
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
