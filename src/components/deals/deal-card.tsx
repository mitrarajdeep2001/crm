"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MoreHorizontal, Paperclip } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, getPriorityColor, formatStatusLabel } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Deal } from "./kanban-board";
import { toast } from "sonner";

interface DealCardProps {
  deal: Deal;
  isDragging?: boolean;
}

export function DealCard({ deal, isDragging = false }: DealCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.3 : 1,
  };

  const priorityVariant = deal.priority as "high" | "medium" | "low";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group relative rounded-xl border bg-white p-4 shadow-sm cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-md ${
        isDragging ? "shadow-2xl scale-105" : ""
      } ${deal.stage === "proposal" ? "border-l-4 border-l-indigo-500 border-r border-t border-b border-gray-100" : "border-gray-100"}`}
    >
      <div className="flex items-start justify-between mb-2">
        <Badge
          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 ${getPriorityColor(deal.priority)}`}
        >
          {deal.priority}
        </Badge>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="opacity-0 group-hover:opacity-100 h-6 w-6 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => toast.success("Opening deal details...")}>
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.success("Deal updated!")}>
              Edit Deal
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600" onClick={() => toast.error("Deal deleted")}>
              Delete Deal
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <h3 className="text-sm font-semibold text-gray-900 leading-tight mb-0.5">{deal.title}</h3>
      <p className="text-xs text-gray-500 mb-3">{deal.company}</p>

      {/* Attachments */}
      {deal.attachments && deal.attachments.length > 0 && (
        <div className="flex items-center gap-1.5 mb-3 bg-gray-50 rounded-lg px-2.5 py-1.5">
          <Paperclip className="h-3 w-3 text-gray-400 flex-shrink-0" />
          <span className="text-xs text-gray-500 truncate">{deal.attachments[0]}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-base font-bold text-indigo-600">
          {formatCurrency(parseFloat(deal.value))}
        </span>
        {deal.assignedTo && (
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-indigo-100 text-indigo-700 text-[10px] font-bold">
              {deal.assignedTo.initials}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  );
}
