"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  CheckSquare,
  Settings,
  Search,
  ArrowRight,
} from "lucide-react";

const commands = [
  { label: "Go to Dashboard", icon: LayoutDashboard, href: "/dashboard", shortcut: "" },
  { label: "Go to Leads", icon: Users, href: "/leads", shortcut: "" },
  { label: "Go to Deals", icon: Briefcase, href: "/deals", shortcut: "" },
  { label: "Go to Tasks", icon: CheckSquare, href: "/tasks", shortcut: "" },
  { label: "Go to Settings", icon: Settings, href: "/settings", shortcut: "" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filtered = commands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase())
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />
      <div className="relative w-full max-w-lg rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
          <Search className="h-5 w-5 text-gray-400 flex-shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search commands, pages, contacts..."
            className="flex-1 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none bg-transparent"
          />
          <kbd className="hidden sm:flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] font-semibold text-gray-500">
            ESC
          </kbd>
        </div>
        <div className="p-2">
          {filtered.length > 0 ? (
            <>
              <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Navigation
              </p>
              {filtered.map((cmd) => {
                const Icon = cmd.icon;
                return (
                  <button
                    key={cmd.href}
                    onClick={() => {
                      router.push(cmd.href);
                      setOpen(false);
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors group"
                  >
                    <Icon className="h-4 w-4 text-gray-400 group-hover:text-indigo-600" />
                    {cmd.label}
                    <ArrowRight className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100 text-indigo-400" />
                  </button>
                );
              })}
            </>
          ) : (
            <div className="py-8 text-center text-sm text-gray-400">
              No results found for &quot;{query}&quot;
            </div>
          )}
        </div>
        <div className="border-t border-gray-100 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3 text-[11px] text-gray-400">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 font-mono font-semibold">↵</kbd>
              to select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 font-mono font-semibold">↑↓</kbd>
              navigate
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-gray-400">
            <kbd className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 font-mono font-semibold">⌘K</kbd>
            to toggle
          </div>
        </div>
      </div>
    </div>
  );
}
