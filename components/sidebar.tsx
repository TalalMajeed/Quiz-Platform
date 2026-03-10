"use client";

import { useState } from "react";
import { ChevronRight, Search, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface ProblemMetadata {
    id: string;
    title: string;
}

interface SidebarProps {
    problems: ProblemMetadata[];
}

export default function Sidebar({ problems }: SidebarProps) {
    const pathname = usePathname();
    const [searchQuery, setSearchQuery] = useState("");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const filteredProblems = problems.filter((p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const currentId = pathname.split("/").pop();

    return (
        <>
            {/* Mobile Toggle */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-navy-950 flex items-center justify-end px-6 z-50">
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="text-white p-2 hover:bg-navy-900 transition-colors"
                >
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Sidebar Drawer */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-40 w-80 bg-navy-950 transition-transform duration-300 lg:relative lg:translate-x-0 flex flex-col h-full overflow-hidden shrink-0 border-none",
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="p-6 border-b border-navy-800 pt-20 lg:pt-8">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                        <input
                            type="text"
                            placeholder="SEARCH..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-navy-900 border border-navy-700 rounded-none py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-white transition-all placeholder:text-navy-500 uppercase tracking-widest"
                        />
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="">
                        {filteredProblems.map((problem) => {
                            const isActive = currentId === problem.id;

                            return (
                                <Link
                                    key={problem.id}
                                    href={`/problems/${problem.id}`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-6 py-4 text-[11px] font-bold transition-all border-b border-navy-900/50 uppercase tracking-widest outline-none group",
                                        isActive
                                            ? "bg-navy-800 text-white"
                                            : "text-navy-400 hover:text-white hover:bg-navy-900"
                                    )}
                                >
                                    <span className="flex-1 text-left truncate pr-2">
                                        {problem.title}
                                    </span>
                                    <ChevronRight className={cn(
                                        "w-3 h-3 transition-all shrink-0",
                                        isActive ? "opacity-100" : "opacity-0"
                                    )} />
                                </Link>
                            );
                        })}

                        {filteredProblems.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-navy-600 text-xs font-bold uppercase">No results</p>
                            </div>
                        )}
                    </div>
                </nav>

                <div className="p-4 border-t border-navy-800 bg-navy-950">
                    <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-navy-500">
                        <div className="flex-1 px-3 py-2 border border-navy-800 flex items-center justify-between">
                            <span>INDEX</span>
                            <span className="text-white">{problems.length}</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-navy-950/60 backdrop-blur-sm z-30 transition-opacity"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </>
    );
}
