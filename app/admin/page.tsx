import { ensureDefaultAdmin, getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  await ensureDefaultAdmin();
  const admin = await getCurrentUser();

  if (!admin) {
    redirect("/admin/login?redirectTo=%2Fadmin");
  }

  if (admin.role !== "admin") {
    redirect("/quizzes");
  }

  redirect("/admin/quizzes");
}
