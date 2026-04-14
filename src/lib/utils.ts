import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | string): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (num >= 1000000) {
    return `$${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `$${(num / 1000).toFixed(0)}K`;
  }
  return `$${num.toLocaleString()}`;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function timeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min${diffMins === 1 ? "" : "s"} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
}

export function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    qualified: "bg-green-100 text-green-700",
    new_lead: "bg-blue-100 text-blue-700",
    in_progress: "bg-amber-100 text-amber-700",
    lost: "bg-red-100 text-red-700",
    converted: "bg-purple-100 text-purple-700",
    // Deal stages
    lead: "bg-slate-100 text-slate-700",
    proposal: "bg-indigo-100 text-indigo-700",
    negotiation: "bg-orange-100 text-orange-700",
    won: "bg-green-100 text-green-700",
    // Tasks
    to_do: "bg-gray-100 text-gray-600",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-600",
  };
  return colors[status] || "bg-gray-100 text-gray-700";
}

export function getPriorityColor(priority: string) {
  const colors: Record<string, string> = {
    high: "bg-orange-100 text-orange-700",
    medium: "bg-indigo-100 text-indigo-600",
    low: "bg-gray-100 text-gray-500",
  };
  return colors[priority] || "bg-gray-100 text-gray-700";
}

export function formatStatusLabel(status: string): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

export function formatSourceLabel(source: string): string {
  const labels: Record<string, string> = {
    linkedin_ads: "LinkedIn Ads",
    direct_referral: "Direct Referral",
    conference: "Conference",
    webinar: "Webinar",
    organic_search: "Organic Search",
    cold_outreach: "Cold Outreach",
    partner: "Partner",
    other: "Other",
  };
  return labels[source] || source;
}
