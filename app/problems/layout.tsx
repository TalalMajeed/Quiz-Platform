import fs from "fs";
import path from "path";
import Sidebar from "@/components/sidebar";

export interface ProblemMetadata {
    id: string;
    title: string;
}

export default function ProblemsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const problemsDir = path.join(process.cwd(), "public", "problems");
    let problems: ProblemMetadata[] = [];

    try {
        const files = fs.readdirSync(problemsDir)
            .filter(file => file.endsWith(".txt"))
            .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

        problems = files.map(file => {
            const id = file.replace(".txt", "");
            const fullPath = path.join(problemsDir, file);
            const content = fs.readFileSync(fullPath, "utf-8");

            // Simple title extraction
            const titleLine = content.split("\n").find(line => line.startsWith("#TITLE "));
            const title = titleLine ? titleLine.replace("#TITLE ", "").trim() : id;

            return { id, title };
        });
    } catch (error) {
        console.error("Error reading problems directory:", error);
    }

    return (
        <div className="flex h-screen w-full overflow-hidden bg-white">
            <Sidebar problems={problems} />
            <main className="flex-1 h-full overflow-y-auto relative pt-16 lg:pt-0">
                {children}
            </main>
        </div>
    );
}
