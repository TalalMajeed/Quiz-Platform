import { StudentManagement } from "@/components/admin/student-management";
import { getAdminDashboardData } from "@/lib/data";

export default async function AdminStudentsPage() {
  const data = await getAdminDashboardData();

  return (
    <div className="space-y-8">
      <header className="border border-slate-200 bg-white p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
          Students
        </p>
        <h1 className="mt-4 text-4xl font-semibold text-slate-950">Students</h1>
        <p className="mt-3 text-sm text-slate-600">
          Create, update, and remove student accounts while keeping the roster and
          submission history in sync.
        </p>
      </header>

      <StudentManagement students={data.students} />
    </div>
  );
}
