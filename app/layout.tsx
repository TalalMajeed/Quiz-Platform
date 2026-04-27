import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { DesktopOnlyGate } from "@/components/desktop-only";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL("https://quiz-platform.local"),
  title: {
    default: "Quiz Platform",
    template: "%s | Quiz Platform"
  },
  description: "Desktop-first quiz platform with student auth, timed quizzes, and admin grading.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <DesktopOnlyGate />
        <main>{children}</main>
      </body>
      <Script src="https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt.min.js" />
      <Script src="https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt-stdlib.js" />
    </html>
  );
}
