import { cn } from "@/lib/utils";

export function Skeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "animate-pulse bg-[linear-gradient(110deg,#e2e8f0,45%,#f8fafc,55%,#e2e8f0)] bg-[length:200%_100%]",
        className
      )}
    />
  );
}
