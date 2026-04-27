"use client";

import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/ui/logout-button";
import { cn } from "@/lib/utils";
import { PendingLink } from "@/components/ui/pending-link";

type AdminShellProps = {
  admin: {
    name: string;
    email: string;
  };
  children: React.ReactNode;
};

const items = [
  { href: "/admin/quizzes", label: "Quizzes" },
  { href: "/admin/students", label: "Students" },
  { href: "/admin/submissions", label: "Submissions" },
];

export function AdminShell({
  admin,
  children,
}: AdminShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <aside className="fixed inset-y-0 left-0 flex w-72 flex-col justify-between overflow-y-auto border-r border-slate-800 bg-[#001b33] p-8">
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
                <PendingLink
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
                </PendingLink>
              );
            })}
          </nav>
        </div>

        <LogoutButton />
      </aside>

      <main className="ml-72 h-screen overflow-y-auto bg-white p-10">
        {children}
      </main>
    </div>
  );
}
