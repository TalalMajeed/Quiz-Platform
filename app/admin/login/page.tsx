import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { getCurrentUser, getPostLoginRedirect, normalizeRedirectPath } from "@/lib/auth";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { redirectTo } = await searchParams;
  const user = await getCurrentUser();

  if (user?.role === "admin") {
    redirect(getPostLoginRedirect(user.role, redirectTo));
  }

  if (user?.role === "student") {
    redirect("/quizzes");
  }

  return (
    <AuthForm
      adminOnly
      redirectTo={normalizeRedirectPath(redirectTo, "/admin")}
    />
  );
}
