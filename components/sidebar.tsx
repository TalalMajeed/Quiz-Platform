import Link from "next/link";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/components/ui/logout-button";

type SidebarProps = {
  pathname: string;
  user: {
    name: string;
    email: string;
    username: string;
  };
};

const items = [
  { href: "/profile", label: "Profile" },
  { href: "/quizzes", label: "Quizzes" },
];

export function Sidebar({ pathname, user }: SidebarProps) {
  return (
    <aside className="flex w-72 shrink-0 flex-col justify-between border-r border-slate-800 bg-[#001b33] p-6">
      <div>
        <div className="border border-slate-700 bg-[#001529] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">
            Quiz Platform
          </p>
          <h1 className="mt-4 text-2xl font-semibold text-white">{user.name}</h1>
          <p className="mt-2 text-sm text-slate-300">
            {user.email || user.username || "Student"}
          </p>
        </div>

        <nav className="mt-8 space-y-3">
          {items.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block border px-5 py-4 text-sm font-semibold transition",
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
  );
}
