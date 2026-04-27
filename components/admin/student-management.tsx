"use client";

import { FormEvent, startTransition, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Student = {
  id: string;
  name: string;
  email: string;
  username: string;
  createdAt: string;
};

type StudentManagementProps = {
  students: Student[];
};

type StudentFormState = {
  name: string;
  email: string;
  password: string;
};

const fieldClass =
  "w-full border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-950";

const blankForm: StudentFormState = {
  name: "",
  email: "",
  password: "",
};

export function StudentManagement({ students }: StudentManagementProps) {
  const router = useRouter();
  const [items, setItems] = useState(students);
  const [message, setMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState("");
  const [form, setForm] = useState<StudentFormState>(blankForm);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingStudentId, setDeletingStudentId] = useState("");

  const editingStudent = useMemo(
    () => items.find((student) => student.id === editingStudentId) || null,
    [editingStudentId, items]
  );

  function openCreateModal() {
    setEditingStudentId("");
    setForm(blankForm);
    setMessage("");
    setIsModalOpen(true);
  }

  function openEditModal(student: Student) {
    setEditingStudentId(student.id);
    setForm({
      name: student.name,
      email: student.email,
      password: "",
    });
    setMessage("");
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingStudentId("");
    setForm(blankForm);
  }

  async function handleSaveStudent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage(editingStudent ? "Updating student..." : "Creating student...");

    const response = await fetch(
      editingStudent ? `/api/admin/students/${editingStudent.id}` : "/api/admin/students",
      {
        method: editingStudent ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      }
    );

    const payload = await response.json();
    setIsSaving(false);

    if (!response.ok) {
      setMessage(payload.error || "Unable to save student.");
      return;
    }

    const nextStudent = payload.student as Student;

    setItems((current) => {
      if (editingStudent) {
        return current.map((student) =>
          student.id === editingStudent.id
            ? { ...student, ...nextStudent }
            : student
        );
      }

      return [{ ...nextStudent, createdAt: new Date().toISOString() }, ...current];
    });

    setMessage(
      editingStudent
        ? `Updated ${nextStudent.email || nextStudent.name}.`
        : `Student created: ${nextStudent.email || nextStudent.name}`
    );
    closeModal();
    startTransition(() => {
      router.refresh();
    });
  }

  async function handleDeleteStudent(student: Student) {
    const confirmed = window.confirm(
      `Delete ${student.name}? This also removes the student's submissions.`
    );

    if (!confirmed) {
      return;
    }

    setDeletingStudentId(student.id);
    setMessage(`Deleting ${student.name}...`);

    const response = await fetch(`/api/admin/students/${student.id}`, {
      method: "DELETE",
    });
    const payload = await response.json().catch(() => ({}));
    setDeletingStudentId("");

    if (!response.ok) {
      setMessage(payload.error || "Unable to delete student.");
      return;
    }

    setItems((current) => current.filter((item) => item.id !== student.id));
    setMessage(`${student.name} deleted.`);
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      <section className="flex items-center justify-between border border-slate-200 bg-white p-8">
        <div>
          <h3 className="text-2xl font-semibold text-slate-950">Students</h3>
          <p className="mt-2 text-sm text-slate-600">
            Create, update, and remove student accounts from one place.
          </p>
        </div>
        <Button type="button" onClick={openCreateModal}>
          New Student
        </Button>
      </section>

      <section className="border border-slate-200 bg-white p-8">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-2xl font-semibold text-slate-950">Student Directory</h3>
          <p className="text-sm text-slate-500">{items.length} total</p>
        </div>

        <div className="mt-5 space-y-4">
          {items.map((student) => (
            <div
              key={student.id}
              className="flex items-start justify-between gap-4 border border-slate-200 bg-white p-4"
            >
              <div>
                <p className="font-semibold text-slate-950">{student.name}</p>
                <p className="mt-1 text-sm text-slate-600">{student.email}</p>
                {student.username && (
                  <p className="mt-1 text-sm text-slate-500">
                    Username: {student.username}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => openEditModal(student)}
                >
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => void handleDeleteStudent(student)}
                  isLoading={deletingStudentId === student.id}
                  loadingLabel="Deleting..."
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <p className="border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
              No students found.
            </p>
          )}
        </div>

        {message && <p className="mt-4 text-sm text-slate-700">{message}</p>}
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-6">
          <div className="w-full max-w-xl border border-slate-300 bg-white p-8 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-2xl font-semibold text-slate-950">
                {editingStudent ? "Update Student Account" : "Create Student Account"}
              </h3>
              <Button type="button" variant="secondary" onClick={closeModal}>
                Close
              </Button>
            </div>

            <form onSubmit={handleSaveStudent} className="mt-6">
              <div className="space-y-4">
                <input
                  name="name"
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, name: event.target.value }))
                  }
                  placeholder="Student name"
                  className={fieldClass}
                />
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, email: event.target.value }))
                  }
                  placeholder="Email"
                  className={fieldClass}
                />
                <input
                  name="password"
                  type="password"
                  minLength={8}
                  value={form.password}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, password: event.target.value }))
                  }
                  placeholder={
                    editingStudent
                      ? "New password (optional)"
                      : "Password"
                  }
                  className={fieldClass}
                />
              </div>
              <div className="mt-6 flex items-center gap-3">
                <Button
                  type="submit"
                  isLoading={isSaving}
                  loadingLabel={editingStudent ? "Updating..." : "Creating..."}
                >
                  {editingStudent ? "Save Changes" : "Create Student"}
                </Button>
                {message && <p className="text-sm text-slate-700">{message}</p>}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
