"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import ReactMarkdown from "react-markdown";

type DraftQuestion = {
  prompt: string;
  type: "short" | "code";
  points: number;
  answer: string;
  starterCode: string;
  rubric: string;
};

type CreateQuizFormProps = {
  mode: "landing" | "editor";
  quizzes?: Array<{
    id: string;
    title: string;
    description: string;
    durationMinutes: number;
    attemptsAllowed: number;
    published: boolean;
    questionCount: number;
  }>;
};

const blankQuestion = (): DraftQuestion => ({
  prompt: "",
  type: "short",
  points: 1,
  answer: "",
  starterCode: "",
  rubric: "",
});

const fieldClass =
  "w-full border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-950";

export function CreateQuizForm({ mode, quizzes = [] }: CreateQuizFormProps) {
  const [questions, setQuestions] = useState<DraftQuestion[]>([blankQuestion()]);
  const [message, setMessage] = useState("");
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  async function handleCreateQuiz(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Saving quiz...");

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/quizzes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: formData.get("title"),
        description: formData.get("description"),
        durationMinutes: Number(formData.get("durationMinutes")),
        attemptsAllowed: Number(formData.get("attemptsAllowed")),
        published: formData.get("published") === "on",
        questions: questions.map((question) => ({
          prompt: question.prompt,
          type: question.type,
          points: question.points,
          answer: question.answer,
          starterCode: question.starterCode,
          rubric: question.rubric,
        })),
      }),
    });

    const payload = await response.json();
    setMessage(payload.error || "Quiz created successfully. Refresh to see the new list.");
  }

  return (
    mode === "editor" ? (
      <form onSubmit={handleCreateQuiz} className="border border-slate-200 bg-white p-8">
        <h3 className="text-2xl font-semibold text-slate-950">Create Quiz</h3>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <input name="title" placeholder="Quiz title" className={fieldClass} />
          <input
            name="durationMinutes"
            type="number"
            min={1}
            placeholder="Duration in minutes"
            className={fieldClass}
          />
          <input
            name="attemptsAllowed"
            type="number"
            min={1}
            defaultValue={1}
            placeholder="Attempts allowed"
            className={fieldClass}
          />
          <textarea
            name="description"
            placeholder="Description"
            className={`${fieldClass} min-h-28 md:col-span-2`}
          />
          <label className="flex items-center gap-3 text-sm text-slate-700">
            <input name="published" type="checkbox" defaultChecked />
            Publish immediately
          </label>
        </div>

        <div className="mt-8 space-y-6">
          {questions.map((question, index) => (
            <section key={index} className="border border-slate-200 bg-slate-50 p-5">
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  value={question.prompt}
                  onChange={(event) => {
                    const next = [...questions];
                    next[index].prompt = event.target.value;
                    setQuestions(next);
                  }}
                  placeholder={`Question ${index + 1} prompt`}
                  className={`${fieldClass} hidden`}
                />
                <textarea
                  value={question.prompt}
                  onChange={(event) => {
                    const next = [...questions];
                    next[index].prompt = event.target.value;
                    setQuestions(next);
                  }}
                  placeholder={`Question ${index + 1} prompt (Markdown supported)`}
                  className={`${fieldClass} min-h-32 md:col-span-2`}
                />
                <div className="md:col-span-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setPreviewIndex((current) => (current === index ? null : index))
                    }
                    className="border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-950"
                  >
                    {previewIndex === index ? "Hide Preview" : "Preview"}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setQuestions((current) =>
                        current.length === 1
                          ? [blankQuestion()]
                          : current.filter((_, questionIndex) => questionIndex !== index)
                      )
                    }
                    className="border border-rose-300 bg-white px-4 py-2 text-sm font-semibold text-rose-700"
                  >
                    Delete Question
                  </button>
                </div>
                {previewIndex === index && (
                  <div className="md:col-span-2 border border-slate-200 bg-white p-4 text-sm text-slate-800">
                    <ReactMarkdown>{question.prompt || "Nothing to preview yet."}</ReactMarkdown>
                  </div>
                )}
                <select
                  value={question.type}
                  onChange={(event) => {
                    const next = [...questions];
                    next[index].type = event.target.value as DraftQuestion["type"];
                    setQuestions(next);
                  }}
                  className={fieldClass}
                >
                  <option value="short">Short Question</option>
                  <option value="code">Code Question</option>
                </select>
                <input
                  type="number"
                  min={1}
                  value={question.points}
                  onChange={(event) => {
                    const next = [...questions];
                    next[index].points = Number(event.target.value);
                    setQuestions(next);
                  }}
                  placeholder="Points"
                  className={fieldClass}
                />
                <textarea
                  value={question.answer}
                  onChange={(event) => {
                    const next = [...questions];
                    next[index].answer = event.target.value;
                    setQuestions(next);
                  }}
                  placeholder="Correct answer or expected value"
                  className={`${fieldClass} min-h-28`}
                />
                {question.type === "code" && (
                  <>
                    <textarea
                      value={question.starterCode}
                      onChange={(event) => {
                        const next = [...questions];
                        next[index].starterCode = event.target.value;
                        setQuestions(next);
                      }}
                      placeholder="Starter code"
                      className={`${fieldClass} min-h-36 md:col-span-2`}
                    />
                    <textarea
                      value={question.rubric}
                      onChange={(event) => {
                        const next = [...questions];
                        next[index].rubric = event.target.value;
                        setQuestions(next);
                      }}
                      placeholder="Rubric for admin grading"
                      className={`${fieldClass} min-h-28 md:col-span-2`}
                    />
                  </>
                )}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => setQuestions((current) => [...current, blankQuestion()])}
            className="border border-slate-950 bg-white px-4 py-3 text-sm font-semibold text-slate-950"
          >
            Add Question
          </button>
          <button
            type="submit"
            className="border border-slate-950 bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
          >
            Save Quiz
          </button>
        </div>
        <p className="mt-4 text-sm text-slate-700">{message}</p>
      </form>
    ) : (
      <div className="space-y-8">
        <section className="border border-slate-200 bg-white p-8">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h3 className="text-2xl font-semibold text-slate-950">Quizzes</h3>
              <p className="mt-2 text-sm text-slate-600">
                Browse all existing quizzes here. Use the button on the right to open the dedicated quiz creation page.
              </p>
            </div>
            <Link
              href="/admin/quizzes/new"
              className="border border-slate-950 bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
            >
              New Quiz
            </Link>
          </div>
        </section>

        <section className="border border-slate-200 bg-white p-8">
          <h3 className="text-2xl font-semibold text-slate-950">Existing Quizzes</h3>
          <div className="mt-5 space-y-4">
            {quizzes.map((quiz) => (
              <div key={quiz.id} className="border border-slate-200 bg-white p-4">
                <p className="font-semibold text-slate-950">{quiz.title}</p>
                <p className="mt-1 text-sm text-slate-600">
                  {quiz.questionCount} questions • {quiz.durationMinutes} minutes • {quiz.attemptsAllowed} attempts
                </p>
                {quiz.description && (
                  <p className="mt-2 text-sm text-slate-600">{quiz.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    )
  );
}
