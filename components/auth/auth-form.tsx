"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type AuthFormProps = {
  adminOnly?: boolean;
};

export function AuthForm({ adminOnly = false }: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      identifier: formData.get("identifier"),
      password: formData.get("password"),
      adminOnly,
    };

    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "Something went wrong.");
      setIsLoading(false);
      return;
    }

    router.push(data.redirectTo || "/quizzes");
    router.refresh();
  }

  return (
    <div className="grid min-h-screen place-items-center bg-[#001b33] px-6">
      <div className="w-full max-w-xl border border-slate-200 bg-white p-10">
        <section>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
            Login
          </p>
          <h2 className="mt-4 text-3xl font-semibold text-slate-950">
            {adminOnly ? "Access the admin panel" : "Access your account"}
          </h2>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Email or username
              </span>
              <input
                name="identifier"
                required
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-950"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Password</span>
              <input
                name="password"
                type="password"
                required
                minLength={8}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-950"
              />
            </label>

            {error && (
              <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              {isLoading ? "Signing in..." : "Login"}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-600">
            {adminOnly ? (
              <>
                Student login:{" "}
                <Link href="/login" className="font-semibold text-slate-950">
                  Open student login
                </Link>
              </>
            ) : (
              <>Student accounts are created by the admin.</>
            )}
          </p>
        </section>
      </div>
    </div>
  );
}
