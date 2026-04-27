import { SubmissionGrader } from "@/components/admin/submission-grader";
import { getAdminDashboardData } from "@/lib/data";

export default async function AdminSubmissionsPage() {
  const data = await getAdminDashboardData();

  return (
    <div className="space-y-8">
      <header className="border border-slate-200 bg-white p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
          Submissions
        </p>
        <h1 className="mt-4 text-4xl font-semibold text-slate-950">Submissions</h1>
        <p className="mt-3 text-sm text-slate-600">
          Review only completed quiz attempts, update grades, and remove submissions
          when needed.
        </p>
      </header>

      <SubmissionGrader submissions={data.submissions} />
    </div>
  );
}
