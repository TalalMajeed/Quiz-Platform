"use client";

import { useState, useEffect, use } from "react";
import ReactMarkdown from "react-markdown";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProblemPageProps {
    params: Promise<{ id: string }>;
}

export default function ProblemPage({ params }: ProblemPageProps) {
    const { id } = use(params);
    const [content, setContent] = useState<string>("");
    const [title, setTitle] = useState<string>("");
    const [summary, setSummary] = useState<string>("");
    const [markdown, setMarkdown] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        async function loadProblem() {
            setIsLoading(true);
            setError(false);
            try {
                const response = await fetch(`/problems/${id}.txt`);
                if (!response.ok) throw new Error("Problem not found");

                const text = await response.text();
                setContent(text);

                // Parse custom markup
                const lines = text.split("\n");
                let parsedTitle = "";
                let parsedSummary = "";
                let contentStartIdx = 0;

                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (line.startsWith("#TITLE ")) {
                        parsedTitle = line.replace("#TITLE ", "").trim();
                        contentStartIdx = i + 1;
                    } else if (line.startsWith("#SUMMARY ")) {
                        parsedSummary = line.replace("#SUMMARY ", "").trim();
                        contentStartIdx = i + 1;
                    } else if (line === "") {
                        contentStartIdx = i + 1;
                    } else {
                        // Stop parsing header at the first line that isn't TITLE, SUMMARY, or empty
                        break;
                    }
                }

                setTitle(parsedTitle || id);
                setSummary(parsedSummary);
                setMarkdown(lines.slice(contentStartIdx).join("\n"));
            } catch (err) {
                console.error(err);
                setError(true);
            } finally {
                setIsLoading(false);
            }
        }

        loadProblem();
    }, [id]);

    if (error) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-12">
                <h3 className="text-xl font-bold text-navy-950 uppercase mb-2">404 - NOT FOUND</h3>
                <p className="text-navy-500 uppercase text-xs tracking-widest">The requested problem could not be located in our system.</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-6 py-12 lg:px-24 min-h-full">
            <article className={cn(
                "transition-all duration-300",
                isLoading ? "opacity-30 translate-y-2 blur-sm" : "opacity-100 translate-y-0 blur-0"
            )}>
                {/* Header Section */}
                <div className="mb-10 border-b-4 border-navy-950 pb-8">
                    <div className="text-navy-500 text-[10px] font-black tracking-[0.2em] uppercase mb-4">
                        PROBLEM ID: {id.padStart(3, '0')}
                    </div>
                    <h2 className="text-3xl lg:text-5xl font-black tracking-tighter text-navy-950 uppercase leading-tight mb-4">
                        {title}
                    </h2>
                    {summary && (
                        <p className="text-navy-600 text-sm lg:text-md uppercase tracking-wide font-bold leading-relaxed border-l-4 border-navy-200 pl-4 py-1">
                            {summary}
                        </p>
                    )}
                </div>

                {/* Content Section */}
                <div className="relative">
                    <ReactMarkdown
                        components={{
                            h1: ({ node, ...props }) => <h1 className="text-2xl lg:text-3xl font-black mb-8 text-navy-950 uppercase border-b-2 border-navy-100 pb-2" {...props} />,
                            h2: ({ node, ...props }) => <h2 className="text-xl font-bold mt-12 mb-6 text-navy-950 uppercase" {...props} />,
                            h3: ({ node, ...props }) => <h3 className="text-lg font-bold mt-8 mb-4 text-navy-900 uppercase" {...props} />,
                            p: ({ node, ...props }) => <p className="leading-relaxed text-navy-800 mb-8 text-base lg:text-lg" {...props} />,
                            ul: ({ node, ...props }) => <ul className="list-none space-y-4 mb-8 text-navy-800" {...props} />,
                            li: ({ node, ...props }) => (
                                <li className="flex gap-4 items-start before:content-['■'] before:text-navy-950 before:text-[10px] before:mt-1.5" {...props} />
                            ),
                            ol: ({ node, ...props }) => <ol className="list-decimal list-inside space-y-4 mb-8 text-navy-800 font-bold" {...props} />,
                            code: ({ node, ...props }) => (
                                <code className="bg-navy-50 text-navy-950 px-2 py-0.5 border border-navy-100 font-mono text-sm break-all" {...props} />
                            ),
                            pre: ({ node, ...props }) => (
                                <pre className="bg-navy-950 text-navy-50 border-0 p-6 lg:p-8 overflow-x-auto my-10 font-mono text-xs lg:text-sm leading-relaxed" {...props} />
                            ),
                            blockquote: ({ node, ...props }) => (
                                <blockquote className="border-l-[8px] lg:border-l-[12px] border-navy-950 bg-navy-50 p-6 lg:p-8 my-10 italic text-navy-900 font-medium" {...props} />
                            ),
                        }}
                    >
                        {markdown}
                    </ReactMarkdown>
                </div>
            </article>

            {/* Persistence styles */}
            <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #102a43;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #001b33;
        }
      `}</style>
        </div>
    );
}
