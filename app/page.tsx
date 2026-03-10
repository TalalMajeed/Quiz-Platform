import { redirect } from "next/navigation";
import fs from "fs";
import path from "path";

export default function Home() {
  const problemsDir = path.join(process.cwd(), "public", "problems");
  let firstProblem = "";

  try {
    const files = fs.readdirSync(problemsDir)
      .filter(file => file.endsWith(".txt"))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    if (files.length > 0) {
      firstProblem = files[0].replace(".txt", "");
    }
  } catch (error) {
    console.error("Error reading problems directory:", error);
  }

  if (firstProblem) {
    redirect(`/problems/${firstProblem}`);
  }

  return (
    <div className="h-screen flex items-center justify-center text-navy-950 font-black uppercase">
      No problems found in system
    </div>
  );
}
