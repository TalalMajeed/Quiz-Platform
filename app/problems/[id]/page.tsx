"use client";

import React, { useState, useEffect, use } from "react";
import ReactMarkdown from "react-markdown";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface ProblemPageProps {
    params: Promise<{ id: string }>;
}

export default function ProblemPage({ params }: ProblemPageProps) {
    const { id } = use(params);
    const router = useRouter();
    const [title, setTitle] = useState<string>("");
    const [summary, setSummary] = useState<string>("");
    const [markdown, setMarkdown] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);
    const [showSolution, setShowSolution] = useState(false);
    const [solution, setSolution] = useState<string>("");
    const [isFetchingSolution, setIsFetchingSolution] = useState(false);

    useEffect(() => {
        async function loadProblem() {
            setIsLoading(true);
            setError(false);
            try {
                const response = await fetch(`/problems/${id}.txt`);

                // If the file doesn't exist or we got an HTML error page back
                if (!response.ok || response.headers.get("Content-Type")?.includes("text/html")) {
                    router.push("/");
                    return;
                }

                const text = await response.text();
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
        // Reset solution state when ID changes
        setShowSolution(false);
        setSolution("");
    }, [id, router]);

    const handleViewSolution = async () => {
        if (showSolution) {
            setShowSolution(false);
            return;
        }

        if (solution) {
            setShowSolution(true);
            return;
        }

        setIsFetchingSolution(true);
        try {
            const response = await fetch(`/solutions/${id}.txt`);
            if (response.ok) {
                const text = await response.text();
                setSolution(text);
                setShowSolution(true);
            } else {
                console.error("Solution not found");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsFetchingSolution(false);
        }
    };

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
                            h1: ({ ...props }) => <h1 className="text-2xl lg:text-3xl font-black mb-8 text-navy-950 uppercase border-b-2 border-navy-100 pb-2" {...props} />,
                            h2: ({ ...props }) => <h2 className="text-xl font-bold mt-12 mb-6 text-navy-950 uppercase" {...props} />,
                            h3: ({ ...props }) => <h3 className="text-lg font-bold mt-8 mb-4 text-navy-900 uppercase" {...props} />,
                            p: ({ ...props }) => <p className="leading-relaxed text-navy-800 mb-8 text-base lg:text-lg" {...props} />,
                            ul: ({ ...props }) => <ul className="list-none space-y-4 mb-8 text-navy-800" {...props} />,
                            li: ({ ...props }) => (
                                <li className="relative pl-8 mb-4 text-navy-800 before:content-['■'] before:text-navy-950 before:text-[10px] before:absolute before:left-0 before:top-2" {...props} />
                            ),
                            ol: ({ ...props }) => <ol className="list-decimal list-inside space-y-4 mb-8 text-navy-800 font-bold" {...props} />,
                            code: ({ ...props }) => (
                                <code className="bg-navy-50 text-navy-950 px-1.5 py-0.5 border border-navy-100 font-mono text-sm whitespace-nowrap" {...props} />
                            ),
                            pre: ({ ...props }) => (
                                <pre className="bg-navy-950 text-navy-50 border-0 p-6 lg:p-8 overflow-x-auto my-10 font-mono text-xs lg:text-sm leading-relaxed" {...props} />
                            ),
                            blockquote: ({ children }) => {
                                const childrenArray = React.Children.toArray(children);

                                // Enhanced detection: Recursive helper to find and strip tag
                                let alertType: "TIP" | "IMPORTANT" | "NOTE" | null = null;
                                let matchStr = "";

                                const findAndStrip = (nodes: React.ReactNode[]): React.ReactNode[] => {
                                    return nodes.map((n, i) => {
                                        if (alertType || i > 1) return n; // Only check the very beginning

                                        if (typeof n === 'string') {
                                            const trimmed = n.trim();
                                            const tip = trimmed.match(/^\[!TIP\]/i);
                                            const imp = trimmed.match(/^\[!IMPORTANT\]/i);
                                            const note = trimmed.match(/^\[!NOTE\]/i);

                                            if (tip || imp || note) {
                                                alertType = tip ? "TIP" : imp ? "IMPORTANT" : "NOTE";
                                                matchStr = tip ? "[!TIP]" : imp ? "[!IMPORTANT]" : "[!NOTE]";

                                                // Strip the tag and any following whitespace or leading newlines
                                                const tagIdx = n.toUpperCase().indexOf(matchStr);
                                                const segment1 = n.slice(0, tagIdx);
                                                const segment2 = n.slice(tagIdx + matchStr.length);
                                                return (segment1 + segment2).replace(/^[\s\n\r]+/, '');
                                            }
                                        }

                                        if (React.isValidElement(n)) {
                                            const element = n as React.ReactElement<{ children?: React.ReactNode }>;
                                            if (element.type === 'p' || element.props.children) {
                                                const childNodes = React.Children.toArray(element.props.children);
                                                const strippedChildren = findAndStrip(childNodes);
                                                if (alertType) {
                                                    return React.cloneElement(element, {
                                                        ...element.props,
                                                        children: strippedChildren
                                                    });
                                                }
                                            }
                                        }
                                        return n;
                                    });
                                };

                                const stripped = findAndStrip(childrenArray);

                                if (alertType) {
                                    const themes: Record<string, { bg: string; border: string; text: string; accent: string; label: string }> = {
                                        TIP: {
                                            bg: "bg-emerald-50/50",
                                            border: "border-emerald-500",
                                            text: "text-emerald-950",
                                            accent: "bg-emerald-500",
                                            label: "PRACTICE TIP",
                                        },
                                        IMPORTANT: {
                                            bg: "bg-rose-50/50",
                                            border: "border-rose-500",
                                            text: "text-rose-950",
                                            accent: "bg-rose-500",
                                            label: "CRITICAL REQUIREMENT",
                                        },
                                        NOTE: {
                                            bg: "bg-blue-50/50",
                                            border: "border-blue-500",
                                            text: "text-blue-950",
                                            accent: "bg-blue-500",
                                            label: "SYSTEM NOTE",
                                        }
                                    };
                                    const config = themes[alertType];

                                    return (
                                        <div className={cn(
                                            "my-14 border-l-4 transition-all duration-700 animate-in fade-in slide-in-from-left-4",
                                            config.bg, config.border
                                        )}>
                                            <div className="p-10 lg:p-14">
                                                <div className={cn(
                                                    "flex items-center gap-4 mb-8 font-black uppercase tracking-[0.35em] text-[12px] opacity-70",
                                                    config.text
                                                )}>
                                                    <span className={cn("inline-block w-4 h-1.5 rounded-full", config.accent)} />
                                                    {config.label}
                                                </div>
                                                <div className={cn("text-xl lg:text-2xl leading-relaxed font-bold tracking-tight", config.text)}>
                                                    {stripped}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <blockquote className="border-l-4 border-navy-950 bg-navy-50 p-10 lg:p-14 my-12 text-navy-900 font-medium leading-relaxed">
                                        {children}
                                    </blockquote>
                                );
                            },
                        }}
                    >
                        {markdown}
                    </ReactMarkdown>
                </div>

                {/* View Solution Section */}
                <div className="mt-16 border-t-2 border-navy-100 pt-10">
                    <button
                        onClick={handleViewSolution}
                        disabled={isFetchingSolution}
                        className={cn(
                            "w-full lg:w-auto px-8 py-4 bg-navy-950 text-white font-black uppercase tracking-widest text-xs hover:bg-navy-800 transition-colors flex items-center justify-center gap-3",
                            isFetchingSolution && "opacity-70 cursor-not-allowed"
                        )}
                    >
                        {isFetchingSolution ? "LOADING SOLUTION..." : showSolution ? "HIDE SOLUTION" : "VIEW SOLUTION"}
                        {!isFetchingSolution && (
                            <span className="text-[10px]">{showSolution ? "▲" : "▼"}</span>
                        )}
                    </button>

                    {showSolution && solution && (
                        <div className="mt-8 animate-in fade-in slide-in-from-top-4 duration-300">
                            <div className="bg-navy-50 border-l-4 border-navy-950 p-6 lg:p-8">
                                <h3 className="text-navy-950 font-black uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-navy-950 rounded-full animate-pulse" />
                                    OFFICIAL IMPLEMENTATION
                                </h3>
                                <pre className="bg-white border border-navy-100 p-6 overflow-x-auto font-mono text-xs lg:text-sm leading-relaxed text-navy-900">
                                    <code>{solution}</code>
                                </pre>
                            </div>
                        </div>
                    )}
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
