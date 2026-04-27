"use client";

import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);

    const response = await fetch("/api/logout", {
      method: "POST",
    });

    const data = await response.json();
    startTransition(() => {
      router.push(data.redirectTo || "/login");
      router.refresh();
    });
  }

  return (
    <Button
      type="button"
      variant="secondary"
      onClick={handleLogout}
      isLoading={isLoading}
      loadingLabel="Signing out..."
      className="w-full rounded-2xl border-slate-700 bg-[#001529] text-slate-300 hover:border-slate-500 hover:bg-[#001d38] hover:text-white"
    >
      Logout
    </Button>
  );
}
