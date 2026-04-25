import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { getCurrentUser } from "@/lib/auth";

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect(user.role === "admin" ? "/admin" : "/quizzes");
  }

  return <AuthForm />;
}
