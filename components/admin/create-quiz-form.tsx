"use client";

import type { Dispatch, SetStateAction } from "react";
import { FormEvent, startTransition, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PendingLink } from "@/components/ui/pending-link";

type DraftQuestion = {
  prompt: string;
  type: "short" | "code";
  points: number;
  answer: string;
  starterCode: string;
  rubric: string;
};

type QuizItem = {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  attemptsAllowed: number;
  published: boolean;
  questionCount: number;
  questions: DraftQuestion[];
};

type CreateQuizFormProps = {
  mode: "landing" | "editor";
  quizzes?: QuizItem[];
};

type QuizDraft = {
  title: string;
  description: string;
  durationMinutes: number;
  attemptsAllowed: number;
  published: boolean;
  questions: DraftQuestion[];
};

const blankQuestion = (): DraftQuestion => ({
  prompt: "",
  type: "short",
  points: 1,
  answer: "",
  starterCode: "",
  rubric: "",
});

const createBlankDraft = (): QuizDraft => ({
  title: "",
  description: "",
  durationMinutes: 30,
  attemptsAllowed: 1,
  published: true,
  questions: [blankQuestion()],
});

function buildDraftFromQuiz(quiz: QuizItem): QuizDraft {
  return {
    title: quiz.title,
    description: quiz.description,
    durationMinutes: quiz.durationMinutes,
    attemptsAllowed: quiz.attemptsAllowed,
    published: quiz.published,
    questions: quiz.questions.length > 0 ? quiz.questions : [blankQuestion()],
  };
}

const fieldClass =
  "w-full border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-950";

function QuizEditorFields({
  draft,
  setDraft,
  previewIndex,
  setPreviewIndex,
}: {
  draft: QuizDraft;
  setDraft: Dispatch<SetStateAction<QuizDraft>>;
  previewIndex: number | null;
  setPreviewIndex: Dispatch<SetStateAction<number | null>>;
}) {
  return (
    <>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <input
          value={draft.title}
          onChange={(event) =>
            setDraft((current) => ({ ...current, title: event.target.value }))
          }
          placeholder="Quiz title"
          className={fieldClass}
        />
        <input
          type="number"
          min={1}
          value={draft.durationMinutes}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              durationMinutes: Number(event.target.value) || 1,
            }))
          }
          placeholder="Duration in minutes"
          className={fieldClass}
        />
        <input
          type="number"
          min={1}
          value={draft.attemptsAllowed}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              attemptsAllowed: Number(event.target.value) || 1,
            }))
          }
          placeholder="Attempts allowed"
          className={fieldClass}
        />
        <textarea
          value={draft.description}
          onChange={(event) =>
            setDraft((current) => ({ ...current, description: event.target.value }))
          }
          placeholder="Description"
          className={`${fieldClass} min-h-28 md:col-span-2`}
        />
        <label className="flex items-center gap-3 text-sm text-slate-700">
          <input
            checked={draft.published}
            onChange={(event) =>
              setDraft((current) => ({ ...current, published: event.target.checked }))
            }
            type="checkbox"
          />
          Publish immediately
        </label>
      </div>

      <div className="mt-8 space-y-6">
        {draft.questions.map((question, index) => (
          <section key={index} className="border border-slate-200 bg-slate-50 p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <textarea
                value={question.prompt}
                onChange={(event) =>
                  setDraft((current) => {
                    const questions = [...current.questions];
                    questions[index] = { ...questions[index], prompt: event.target.value };
                    return { ...current, questions };
                  })
                }
                placeholder={`Question ${index + 1} prompt (Markdown supported)`}
                className={`${fieldClass} min-h-32 md:col-span-2`}
              />
              <div className="md:col-span-2 flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    setPreviewIndex((current) => (current === index ? null : index))
                  }
                >
                  {previewIndex === index ? "Hide Preview" : "Preview"}
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  onClick={() =>
                    setDraft((current) => ({
                      ...current,
                      questions:
                        current.questions.length === 1
                          ? [blankQuestion()]
                          : current.questions.filter(
                              (_, questionIndex) => questionIndex !== index
                            ),
                    }))
                  }
                >
                  Delete Question
                </Button>
              </div>
              {previewIndex === index && (
                <div className="md:col-span-2 border border-slate-200 bg-white p-4 text-sm text-slate-800">
                  <ReactMarkdown>{question.prompt || "Nothing to preview yet."}</ReactMarkdown>
                </div>
              )}
              <select
                value={question.type}
                onChange={(event) =>
                  setDraft((current) => {
                    const questions = [...current.questions];
                    questions[index] = {
                      ...questions[index],
                      type: event.target.value as DraftQuestion["type"],
                    };
                    return { ...current, questions };
                  })
                }
                className={fieldClass}
              >
                <option value="short">Short Question</option>
                <option value="code">Code Question</option>
              </select>
              <input
                type="number"
                min={1}
                value={question.points}
                onChange={(event) =>
                  setDraft((current) => {
                    const questions = [...current.questions];
                    questions[index] = {
                      ...questions[index],
                      points: Number(event.target.value) || 1,
                    };
                    return { ...current, questions };
                  })
                }
                placeholder="Points"
                className={fieldClass}
              />
              <textarea
                value={question.answer}
                onChange={(event) =>
                  setDraft((current) => {
                    const questions = [...current.questions];
                    questions[index] = {
                      ...questions[index],
                      answer: event.target.value,
                    };
                    return { ...current, questions };
                  })
                }
                placeholder="Correct answer or expected value"
                className={`${fieldClass} min-h-28`}
              />
              {question.type === "code" && (
                <>
                  <textarea
                    value={question.starterCode}
                    onChange={(event) =>
                      setDraft((current) => {
                        const questions = [...current.questions];
                        questions[index] = {
                          ...questions[index],
                          starterCode: event.target.value,
                        };
                        return { ...current, questions };
                      })
                    }
                    placeholder="Starter code"
                    className={`${fieldClass} min-h-36 md:col-span-2`}
                  />
                  <textarea
                    value={question.rubric}
                    onChange={(event) =>
                      setDraft((current) => {
                        const questions = [...current.questions];
                        questions[index] = {
                          ...questions[index],
                          rubric: event.target.value,
                        };
                        return { ...current, questions };
                      })
                    }
                    placeholder="Rubric for admin grading"
                    className={`${fieldClass} min-h-28 md:col-span-2`}
                  />
                </>
              )}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}

export function CreateQuizForm({ mode, quizzes = [] }: CreateQuizFormProps) {
  const router = useRouter();
  const [items, setItems] = useState(quizzes);
  const [draft, setDraft] = useState<QuizDraft>(createBlankDraft());
  const [message, setMessage] = useState("");
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [editingQuizId, setEditingQuizId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingQuizId, setDeletingQuizId] = useState("");
  const [copiedQuizId, setCopiedQuizId] = useState("");

  const editingQuiz = useMemo(
    () => items.find((quiz) => quiz.id === editingQuizId) || null,
    [editingQuizId, items]
  );

  async function saveQuiz(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage(editingQuiz ? "Updating quiz..." : "Saving quiz...");

    const response = await fetch(
      editingQuiz ? `/api/admin/quizzes/${editingQuiz.id}` : "/api/admin/quizzes",
      {
        method: editingQuiz ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(draft),
      }
    );

    const payload = await response.json();
    setIsSaving(false);

    if (!response.ok) {
      setMessage(payload.error || "Unable to save quiz.");
      return;
    }

    const nextQuiz = payload.quiz as {
      id: string;
      title: string;
      description: string;
      durationMinutes: number;
      attemptsAllowed: number;
      published: boolean;
      questions: DraftQuestion[];
    };

    const normalizedQuiz: QuizItem = {
      ...nextQuiz,
      questionCount: nextQuiz.questions.length,
    };

    setItems((current) => {
      if (editingQuiz) {
        return current.map((quiz) =>
          quiz.id === editingQuiz.id ? normalizedQuiz : quiz
        );
      }

      return [normalizedQuiz, ...current];
    });

    setMessage(
      editingQuiz
        ? `Updated ${normalizedQuiz.title}.`
        : `${normalizedQuiz.title} created successfully.`
    );

    if (mode === "landing") {
      setIsModalOpen(false);
      setEditingQuizId("");
      setDraft(createBlankDraft());
    } else {
      setDraft(createBlankDraft());
      setPreviewIndex(null);
    }

    startTransition(() => {
      router.refresh();
    });
  }

  function openEditModal(quiz: QuizItem) {
    setEditingQuizId(quiz.id);
    setDraft(buildDraftFromQuiz(quiz));
    setPreviewIndex(null);
    setMessage("");
    setIsModalOpen(true);
  }

  async function handleCopyQuizLink(quiz: QuizItem) {
    const url = `${window.location.origin}/quizzes/${quiz.id}`;

    try {
      await navigator.clipboard.writeText(url);
      setCopiedQuizId(quiz.id);
      setMessage(`Copied link for ${quiz.title}.`);
      window.setTimeout(() => {
        setCopiedQuizId((current) => (current === quiz.id ? "" : current));
      }, 2000);
    } catch {
      setMessage("Unable to copy the link right now.");
    }
  }

  async function handleDeleteQuiz(quiz: QuizItem) {
    const confirmed = window.confirm(
      `Delete ${quiz.title}? This also removes submissions for this quiz.`
    );

    if (!confirmed) {
      return;
    }

    setDeletingQuizId(quiz.id);
    setMessage(`Deleting ${quiz.title}...`);

    const response = await fetch(`/api/admin/quizzes/${quiz.id}`, {
      method: "DELETE",
    });
    const payload = await response.json().catch(() => ({}));
    setDeletingQuizId("");

    if (!response.ok) {
      setMessage(payload.error || "Unable to delete quiz.");
      return;
    }

    setItems((current) => current.filter((item) => item.id !== quiz.id));
    setMessage(`${quiz.title} deleted.`);
    startTransition(() => {
      router.refresh();
    });
  }

  if (mode === "editor") {
    return (
      <form onSubmit={saveQuiz} className="border border-slate-200 bg-white p-8">
        <h3 className="text-2xl font-semibold text-slate-950">Create Quiz</h3>

        <QuizEditorFields
          draft={draft}
          setDraft={setDraft}
          previewIndex={previewIndex}
          setPreviewIndex={setPreviewIndex}
        />

        <div className="mt-6 flex gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              setDraft((current) => ({
                ...current,
                questions: [...current.questions, blankQuestion()],
              }))
            }
          >
            Add Question
          </Button>
          <Button
            type="submit"
            isLoading={isSaving}
            loadingLabel="Saving quiz..."
          >
            Save Quiz
          </Button>
        </div>
        {message && <p className="mt-4 text-sm text-slate-700">{message}</p>}
      </form>
    );
  }

  return (
    <div className="space-y-8">
      <section className="border border-slate-200 bg-white p-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h3 className="text-2xl font-semibold text-slate-950">Quizzes</h3>
            <p className="mt-2 text-sm text-slate-600">
              Create, update, publish, and remove quizzes without leaving the admin flow.
            </p>
          </div>
          <PendingLink
            href="/admin/quizzes/new"
            pendingLabel="Opening editor..."
            showLoader
            buttonStyle
          >
            New Quiz
          </PendingLink>
        </div>
      </section>

      <section className="border border-slate-200 bg-white p-8">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-2xl font-semibold text-slate-950">Existing Quizzes</h3>
          <p className="text-sm text-slate-500">{items.length} total</p>
        </div>

        <div className="mt-5 space-y-4">
          {items.map((quiz) => (
            <div key={quiz.id} className="border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-950">{quiz.title}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {quiz.questionCount} questions • {quiz.durationMinutes} minutes •{" "}
                    {quiz.attemptsAllowed} attempts
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {quiz.published ? "Published" : "Draft"}
                  </p>
                  {quiz.description && (
                    <p className="mt-2 text-sm text-slate-600">{quiz.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => void handleCopyQuizLink(quiz)}
                  >
                    {copiedQuizId === quiz.id ? "Copied" : "Copy Link"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => openEditModal(quiz)}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() => void handleDeleteQuiz(quiz)}
                    isLoading={deletingQuizId === quiz.id}
                    loadingLabel="Deleting..."
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <p className="border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
              No quizzes available yet.
            </p>
          )}
        </div>

        {message && <p className="mt-4 text-sm text-slate-700">{message}</p>}
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 px-6 py-10">
          <div className="mx-auto w-full max-w-5xl border border-slate-300 bg-white p-8 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-2xl font-semibold text-slate-950">
                {editingQuiz ? `Edit ${editingQuiz.title}` : "Edit Quiz"}
              </h3>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingQuizId("");
                  setDraft(createBlankDraft());
                }}
              >
                Close
              </Button>
            </div>

            <form onSubmit={saveQuiz} className="mt-6">
              <QuizEditorFields
                draft={draft}
                setDraft={setDraft}
                previewIndex={previewIndex}
                setPreviewIndex={setPreviewIndex}
              />

              <div className="mt-6 flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    setDraft((current) => ({
                      ...current,
                      questions: [...current.questions, blankQuestion()],
                    }))
                  }
                >
                  Add Question
                </Button>
                <Button
                  type="submit"
                  isLoading={isSaving}
                  loadingLabel="Saving quiz..."
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
