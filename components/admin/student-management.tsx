"use client";

import { FormEvent, useState } from "react";

type StudentManagementProps = {
  students: Array<{
    id: string;
    name: string;
    email: string;
    createdAt: string;
  }>;
};

const fieldClass =
  "w-full border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none placeholder:text-slate-400 focus:border-slate-950";

export function StudentManagement({ students }: StudentManagementProps) {
  const [message, setMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  async function handleCreateStudent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Creating student...");
    const formData = new FormData(event.currentTarget);

    const response = await fetch("/api/admin/students", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
      }),
    });

    const payload = await response.json();
    setMessage(payload.error || `Student created: ${payload.student.email}`);
    if (response.ok) {
      setIsModalOpen(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="flex items-center justify-between border border-slate-200 bg-white p-8">
        <div>
          <h3 className="text-2xl font-semibold text-slate-950">Students</h3>
          <p className="mt-2 text-sm text-slate-600">
            Add new students from a modal instead of keeping the form on the page.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="border border-slate-950 bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
        >
          New Student
        </button>
      </section>

      <section className="border border-slate-200 bg-white p-8">
        <h3 className="text-2xl font-semibold text-slate-950">Students</h3>
        <div className="mt-5 space-y-4">
          {students.map((student) => (
            <div key={student.id} className="border border-slate-200 bg-white p-4">
              <p className="font-semibold text-slate-950">{student.name}</p>
              <p className="mt-1 text-sm text-slate-600">{student.email}</p>
            </div>
          ))}
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-6">
          <div className="w-full max-w-xl border border-slate-300 bg-white p-8 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-2xl font-semibold text-slate-950">
                Create Student Account
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="border border-slate-300 px-3 py-2 text-sm text-slate-700"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="mt-6">
              <div className="space-y-4">
                <input name="name" placeholder="Student name" className={fieldClass} />
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  className={fieldClass}
                />
                <input
                  name="password"
                  type="password"
                  minLength={8}
                  placeholder="Password"
                  className={fieldClass}
                />
              </div>
              <div className="mt-6 flex items-center gap-3">
                <button
                  type="submit"
                  className="border border-slate-950 bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
                >
                  Create Student
                </button>
                <p className="text-sm text-slate-700">{message}</p>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
