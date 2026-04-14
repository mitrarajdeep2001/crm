"use client";

import { useState } from "react";
import Link from "next/link";
import { MoreVertical, ChevronLeft, ChevronRight } from "lucide-react";
import { mockLeads } from "@/lib/data/mock";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDate, getStatusColor, formatStatusLabel, formatSourceLabel } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 4;

export function LeadsTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [leads] = useState(mockLeads);

  const totalPages = Math.ceil(leads.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentLeads = leads.slice(startIdx, startIdx + ITEMS_PER_PAGE);

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
            {currentLeads.map((lead) => (
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
                      <button className="opacity-0 group-hover:opacity-100 flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/leads/${lead.id}`}>View Details</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast.success("Lead marked as qualified")}>
                        Mark as Qualified
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast.success("Converting to deal...")}>
                        Convert to Deal
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={() => toast.error("Lead deleted")}>
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
          Showing <span className="font-semibold text-gray-700">{startIdx + 1}-{Math.min(startIdx + ITEMS_PER_PAGE, leads.length)}</span> of{" "}
          <span className="font-semibold text-gray-700">124</span> leads
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {[1, 2, 3].map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`flex h-7 w-7 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                currentPage === page
                  ? "bg-indigo-600 text-white"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {page}
            </button>
          ))}
          <span className="px-2 text-gray-400">...</span>
          <button
            onClick={() => setCurrentPage(31)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100"
          >
            31
          </button>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-40 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Card>
  );
}
