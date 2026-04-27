import { cn } from "@/lib/utils";
import { LogoutButton } from "@/components/ui/logout-button";
import { PendingLink } from "@/components/ui/pending-link";

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
    <aside className="fixed inset-y-0 left-0 flex w-72 flex-col justify-between overflow-y-auto border-r border-slate-800 bg-[#001b33] p-6">
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
              <PendingLink
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
              </PendingLink>
            );
          })}
        </nav>
      </div>

      <LogoutButton />
    </aside>
  );
}
