import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { getCurrentUser, getPostLoginRedirect, normalizeRedirectPath } from "@/lib/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { redirectTo } = await searchParams;
  const user = await getCurrentUser();

  if (user) {
    redirect(getPostLoginRedirect(user.role, redirectTo));
  }

  return (
    <AuthForm
      redirectTo={normalizeRedirectPath(redirectTo, "/quizzes")}
    />
  );
}
