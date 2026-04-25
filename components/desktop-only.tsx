"use client";

import { useEffect, useState } from "react";

export function DesktopOnlyGate() {
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (isDesktop) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white px-6">
      <div className="w-full max-w-2xl border border-slate-300 bg-white">
        <div className="border-b border-slate-300 bg-[#001b33] px-8 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-200">
            Desktop Only
          </p>
        </div>

        <div className="px-8 py-10">
          <h2 className="text-4xl font-semibold text-slate-950">
            This platform is only available on desktop screens.
          </h2>
          <p className="mt-5 max-w-xl text-sm leading-7 text-slate-600">
            Open the site on a laptop or desktop to log in, solve quizzes, and use
            the admin panel. Mobile and small-tablet layouts are intentionally
            blocked.
          </p>
        </div>
      </div>
    </div>
  );
}
