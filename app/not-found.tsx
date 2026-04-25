import Link from "next/link";

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
          <Link
            href="/login"
            className="border border-slate-950 bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
          >
            Go to login
          </Link>
          <Link
            href="/"
            className="border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-950"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
