"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { MoreHorizontal, Plus } from "lucide-react";
import { DealCard } from "./deal-card";
import type { DealStage, Deal } from "./kanban-board";

interface KanbanColumnProps {
  id: DealStage;
  label: string;
  color: string;
  deals: Deal[];
}

export function KanbanColumn({ id, label, color, deals }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className="flex flex-col w-72 flex-shrink-0">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3 px-0.5">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{label}</span>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-500">
            {deals.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button className="flex h-6 w-6 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <Plus className="h-3.5 w-3.5" />
          </button>
          <button className="flex h-6 w-6 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 min-h-32 rounded-xl p-2 transition-colors space-y-3 ${
          isOver ? "bg-indigo-50/70 ring-2 ring-indigo-200 ring-dashed" : "bg-gray-50/50"
        }`}
      >
        <SortableContext items={deals.map((d) => d.id)} strategy={verticalListSortingStrategy}>
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </SortableContext>
        {deals.length === 0 && (
          <div className="flex h-16 items-center justify-center rounded-xl border-2 border-dashed border-gray-200">
            <p className="text-xs text-gray-400">Drop deals here</p>
          </div>
        )}
      </div>
    </div>
  );
}
