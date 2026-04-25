import Link from "next/link";
import { LogoutButton } from "@/components/ui/logout-button";
import { cn } from "@/lib/utils";

type AdminShellProps = {
  admin: {
    name: string;
    email: string;
  };
  pathname: string;
  title: string;
  description: string;
  children: React.ReactNode;
};

const items = [
  { href: "/admin/quizzes", label: "Quizzes" },
  { href: "/admin/students", label: "Students" },
  { href: "/admin/submissions", label: "Submissions" },
];

export function AdminShell({
  admin,
  pathname,
  title,
  description,
  children,
}: AdminShellProps) {
  return (
    <div className="flex min-h-screen bg-white text-slate-950">
      <aside className="flex w-72 shrink-0 flex-col justify-between border-r border-slate-800 bg-[#001b33] p-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">
            Admin Panel
          </p>
          <h1 className="mt-4 text-3xl font-semibold text-white">
            {admin.name}
          </h1>
          <p className="mt-2 text-sm text-slate-300">{admin.email}</p>

          <nav className="mt-10 space-y-2">
            {items.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "block border px-4 py-3 text-sm font-medium transition",
                    isActive
                      ? "border-slate-200 bg-slate-200 text-[#001b33]"
                      : "border-slate-700 bg-[#001529] text-slate-300 hover:border-slate-500 hover:text-white"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <LogoutButton />
      </aside>

      <main className="flex-1 bg-white p-10">
        <header className="border border-slate-200 bg-white p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            {title}
          </p>
          <h2 className="mt-4 text-4xl font-semibold text-slate-950">{title}</h2>
          <p className="mt-3 text-sm text-slate-600">{description}</p>
        </header>
        <div className="mt-8">{children}</div>
      </main>
    </div>
  );
}
