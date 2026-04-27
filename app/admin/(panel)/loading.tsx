import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-44 w-full border border-slate-200" />
      <Skeleton className="h-[32rem] w-full border border-slate-200" />
    </div>
  );
}
