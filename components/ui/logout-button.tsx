"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);

    const response = await fetch("/api/logout", {
      method: "POST",
    });

    const data = await response.json();
    router.push(data.redirectTo || "/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-2xl border border-white/15 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-amber-300/50 hover:text-white"
      disabled={isLoading}
    >
      {isLoading ? "Signing out..." : "Logout"}
    </button>
  );
}
