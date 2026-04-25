import { AppShell } from "@/components/student/app-shell";
import { requireStudent } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongoose";
import { Submission } from "@/lib/models/submission";

export default async function ProfilePage() {
  const user = await requireStudent();
  await connectToDatabase();

  const submissions = await Submission.find({ userId: user.id }).lean();
  const completed = submissions.filter((submission) => submission.status !== "in_progress");
  const averageScore = completed.length
    ? Math.round(
        completed.reduce((sum, submission) => sum + submission.score, 0) /
          completed.length
      )
    : 0;

  return (
    <AppShell pathname="/profile" user={user}>
      <div className="mx-auto max-w-5xl">
        <div className="border border-slate-200 bg-white p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Profile
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-slate-950">{user.name}</h1>
          <p className="mt-3 text-sm text-slate-600">
            Email: {user.email || "Not provided"}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Username: {user.username || "Not provided"}
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-500">Total attempts</p>
            <p className="mt-3 text-4xl font-semibold text-slate-950">{submissions.length}</p>
          </div>
          <div className="border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-500">Completed quizzes</p>
            <p className="mt-3 text-4xl font-semibold text-slate-950">{completed.length}</p>
          </div>
          <div className="border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-500">Average score</p>
            <p className="mt-3 text-4xl font-semibold text-slate-950">{averageScore}</p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
