import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { getCurrentUser } from "@/lib/auth";

export default async function AdminLoginPage() {
  const user = await getCurrentUser();

  if (user?.role === "admin") {
    redirect("/admin");
  }

  if (user?.role === "student") {
    redirect("/quizzes");
  }

  return <AuthForm adminOnly />;
}
