import { KanbanBoard } from "@/components/deals/kanban-board";
import { DealsHeader } from "@/components/deals/deals-header";

export default function DealsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <DealsHeader />
      <KanbanBoard />
    </div>
  );
}
