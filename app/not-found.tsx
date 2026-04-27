import { PendingLink } from "@/components/ui/pending-link";

export default function NotFoundPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-[#001b33] px-6">
      <div className="w-full max-w-xl border border-slate-200 bg-white p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">
          404
        </p>
        <h1 className="mt-4 text-3xl font-semibold text-slate-950">
          Page not found
        </h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          The page you requested does not exist or may have been moved.
        </p>
        <div className="mt-8 flex gap-3">
          <PendingLink
            href="/login"
            pendingLabel="Opening..."
            showLoader
            buttonStyle
          >
            Go to login
          </PendingLink>
          <PendingLink
            href="/"
            pendingLabel="Opening..."
            showLoader
            buttonStyle
            variant="secondary"
          >
            Home
          </PendingLink>
        </div>
      </div>
    </div>
  );
}
