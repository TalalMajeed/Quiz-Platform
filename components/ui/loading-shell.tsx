import { Skeleton } from "@/components/ui/skeleton";

export function StudentShellSkeleton() {
  return (
    <div className="min-h-screen bg-white text-slate-950">
      <aside className="fixed inset-y-0 left-0 w-72 border-r border-slate-800 bg-[#001b33]" />
      <main className="ml-72 h-screen overflow-y-auto px-10 py-10">
        <div className="mx-auto max-w-6xl space-y-6">
          <Skeleton className="h-40 w-full border border-slate-200" />
          <div className="grid gap-6 xl:grid-cols-2">
            <Skeleton className="h-64 w-full border border-slate-200" />
            <Skeleton className="h-64 w-full border border-slate-200" />
          </div>
        </div>
      </main>
    </div>
  );
}

export function AdminShellSkeleton() {
  return (
    <div className="min-h-screen bg-white text-slate-950">
      <aside className="fixed inset-y-0 left-0 w-72 border-r border-slate-800 bg-[#001b33]" />
      <main className="ml-72 h-screen overflow-y-auto p-10">
        <Skeleton className="h-44 w-full border border-slate-200" />
        <Skeleton className="mt-8 h-[32rem] w-full border border-slate-200" />
      </main>
    </div>
  );
}

export function QuizAttemptSkeleton() {
  return (
    <div className="min-h-screen bg-white px-10 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <Skeleton className="h-32 w-full border border-slate-200" />
        <Skeleton className="h-[34rem] w-full border border-slate-200" />
        <Skeleton className="h-24 w-full border border-slate-200" />
      </div>
    </div>
  );
}

export function AuthPageSkeleton() {
  return (
    <div className="grid min-h-screen place-items-center bg-[#001b33] px-6">
      <div className="w-full max-w-xl border border-slate-200 bg-white p-10">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="mt-4 h-10 w-72" />
        <Skeleton className="mt-8 h-14 w-full border border-slate-200" />
        <Skeleton className="mt-5 h-14 w-full border border-slate-200" />
        <Skeleton className="mt-5 h-12 w-full border border-slate-200" />
      </div>
    </div>
  );
}
