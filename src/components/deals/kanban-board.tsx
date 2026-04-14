"use client";

import { useState } from "react";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors, closestCorners } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { mockDeals } from "@/lib/data/mock";
import { KanbanColumn } from "./kanban-column";
import { DealCard } from "./deal-card";
import { toast } from "sonner";

export type DealStage = "lead" | "qualified" | "proposal" | "negotiation" | "won" | "lost";

export type Deal = (typeof mockDeals)[0];

const columns: { id: DealStage; label: string; color: string }[] = [
  { id: "lead", label: "Lead", color: "#94a3b8" },
  { id: "qualified", label: "Qualified", color: "#4f46e5" },
  { id: "proposal", label: "Proposal", color: "#8b5cf6" },
  { id: "negotiation", label: "Negotiation", color: "#f59e0b" },
  { id: "won", label: "Won", color: "#10b981" },
  { id: "lost", label: "Lost", color: "#ef4444" },
];

export function KanbanBoard() {
  const [deals, setDeals] = useState<Deal[]>(mockDeals as Deal[]);
  const [activeId, setActiveId] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const getActiveDeal = () => deals.find((d) => d.id === activeId);

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as number);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) {
      setActiveId(null);
      return;
    }

    const dealId = active.id as number;
    const newStage = over.id as DealStage;

    if (columns.some((c) => c.id === newStage)) {
      setDeals((prev) => {
        const deal = prev.find((d) => d.id === dealId);
        if (deal && deal.stage !== newStage) {
          toast.success(`Deal moved to ${newStage.charAt(0).toUpperCase() + newStage.slice(1)}`);
          return prev.map((d) =>
            d.id === dealId ? { ...d, stage: newStage } : d
          );
        }
        return prev;
      });
    }
    setActiveId(null);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => {
          const columnDeals = deals.filter((d) => d.stage === column.id);
          return (
            <KanbanColumn
              key={column.id}
              id={column.id}
              label={column.label}
              color={column.color}
              deals={columnDeals}
            />
          );
        })}
      </div>
      <DragOverlay>
        {activeId ? (
          <div className="rotate-3 opacity-90 shadow-2xl">
            <DealCard deal={getActiveDeal()!} isDragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
