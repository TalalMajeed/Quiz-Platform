import { Sidebar } from "@/components/sidebar";

type AppShellProps = {
  pathname: string;
  user: {
    name: string;
    email: string;
    username: string;
  };
  children: React.ReactNode;
};

export function AppShell({ pathname, user, children }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-white text-slate-950">
      <Sidebar pathname={pathname} user={user} />
      <main className="flex-1 bg-white px-10 py-10">
        {children}
      </main>
    </div>
  );
}
