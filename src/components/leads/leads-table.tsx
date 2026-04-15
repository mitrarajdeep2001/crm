"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MoreVertical, ChevronLeft, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatStatusLabel, formatSourceLabel } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 4;

type LeadListItem = {
  id: number;
  leadId: string;
  firstName: string;
  lastName: string;
  email: string;
  status: "new_lead" | "qualified" | "in_progress" | "lost" | "converted";
  source: "linkedin_ads" | "direct_referral" | "conference" | "webinar" | "organic_search" | "cold_outreach" | "partner" | "other";
  assignedTo: { name: string; initials: string; email?: string | null } | null;
  createdAt: string | Date;
};

interface LeadsTableProps {
  search: string;
  status: string;
  refreshKey: number;
}

export function LeadsTable({ search, status, refreshKey }: LeadsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [leads, setLeads] = useState<LeadListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, status]);

  useEffect(() => {
    let isMounted = true;

    async function loadLeads() {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(currentPage),
          limit: String(ITEMS_PER_PAGE),
        });
        if (search.trim().length > 0) {
          params.set("search", search.trim());
        }
        if (status !== "all") {
          params.set("status", status);
        }

        const response = await fetch(`/api/leads?${params.toString()}`, {
          method: "GET",
        });
        const data = (await response.json()) as {
          error?: string;
          data?: LeadListItem[];
          total?: number;
          totalPages?: number;
        };

        if (!response.ok || !data.data) {
          if (isMounted) {
            setLeads([]);
            setTotal(0);
            setTotalPages(1);
          }
          return;
        }

        if (isMounted) {
          setLeads(data.data);
          setTotal(data.total ?? 0);
          setTotalPages(Math.max(1, data.totalPages ?? 1));
        }
      } catch {
        if (isMounted) {
          setLeads([]);
          setTotal(0);
          setTotalPages(1);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadLeads();
    return () => {
      isMounted = false;
    };
  }, [currentPage, search, status, refreshKey]);

  const visiblePages = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (currentPage <= 3) {
      return [1, 2, 3, 4, 5];
    }
    if (currentPage >= totalPages - 2) {
      return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
  }, [currentPage, totalPages]);

  async function updateLead(id: number, body: Record<string, unknown>, successMessage: string) {
    try {
      const response = await fetch(`/api/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        toast.error(data.error || "Failed to update lead");
        return;
      }

      toast.success(successMessage);
      setLeads((current) =>
        current.map((lead) =>
          lead.id === id ? { ...lead, ...(body as Partial<LeadListItem>) } : lead
        )
      );
    } catch {
      toast.error("Failed to update lead");
    }
  }

  async function deleteLead(id: number) {
    try {
      const response = await fetch(`/api/leads/${id}`, { method: "DELETE" });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        toast.error(data.error || "Failed to delete lead");
        return;
      }

      toast.success("Lead deleted");
      setLeads((current) => current.filter((lead) => lead.id !== id));
      setTotal((value) => Math.max(0, value - 1));
      window.dispatchEvent(new Event("leads:changed"));
    } catch {
      toast.error("Failed to delete lead");
    }
  }

  const statusVariantMap: Record<string, "qualified" | "new_lead" | "in_progress" | "lost" | "converted" | "default"> = {
    qualified: "qualified",
    new_lead: "new_lead",
    in_progress: "in_progress",
    lost: "lost",
    converted: "converted",
  };

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              {["Name", "Email", "Status", "Source", "Assigned To", "Created Date", "Actions"].map((h) => (
                <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              Array.from({ length: ITEMS_PER_PAGE }, (_, index) => (
                <tr key={`lead-skeleton-${index}`}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <Skeleton className="h-4 w-40" />
                  </td>
                  <td className="px-5 py-4">
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </td>
                  <td className="px-5 py-4">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-6 w-6 rounded-full" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <Skeleton className="h-4 w-20" />
                  </td>
                  <td className="px-5 py-4">
                    <Skeleton className="h-7 w-7 rounded-lg" />
                  </td>
                </tr>
              ))
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-sm text-gray-400">
                  No leads found.
                </td>
              </tr>
            ) : leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs font-bold">
                        {lead.firstName[0]}{lead.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <Link
                      href={`/leads/${lead.id}`}
                      className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors text-sm"
                    >
                      {lead.firstName} {lead.lastName}
                    </Link>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-gray-500">{lead.email}</td>
                <td className="px-5 py-4">
                  <Badge variant={statusVariantMap[lead.status] || "default"}>
                    {formatStatusLabel(lead.status)}
                  </Badge>
                </td>
                <td className="px-5 py-4 text-sm text-gray-600">{formatSourceLabel(lead.source)}</td>
                <td className="px-5 py-4">
                  {lead.assignedTo ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-slate-200 text-slate-600 text-[10px] font-bold">
                          {lead.assignedTo.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-700">{lead.assignedTo.name}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400 italic">Unassigned</span>
                  )}
                </td>
                <td className="px-5 py-4 text-sm text-gray-500">
                  {formatDate(lead.createdAt)}
                </td>
                <td className="px-5 py-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/leads/${lead.id}`}>View Details</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => void updateLead(lead.id, { status: "qualified" }, "Lead marked as qualified")}>
                        Mark as Qualified
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => void updateLead(lead.id, { status: "converted" }, "Lead converted")}>
                        Convert to Deal
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={() => void deleteLead(lead.id)}>
                        Delete Lead
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4">
        <p className="text-sm text-gray-500">
          Showing <span className="font-semibold text-gray-700">{total === 0 ? 0 : startIdx + 1}-{Math.min(startIdx + ITEMS_PER_PAGE, total)}</span> of{" "}
          <span className="font-semibold text-gray-700">{total}</span> leads
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={isLoading || currentPage === 1}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {visiblePages.map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              disabled={isLoading}
              className={`flex h-7 w-7 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                currentPage === page
                  ? "bg-indigo-600 text-white"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {page}
            </button>
          ))}
          {totalPages > 5 ? <span className="px-2 text-gray-400">of {totalPages}</span> : null}
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={isLoading || currentPage === totalPages}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-40 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Card>
  );
}
