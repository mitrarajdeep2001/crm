"use client";

import { useState } from "react";
import { mockTasks } from "@/lib/data/mock";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDate, getPriorityColor, getStatusColor, formatStatusLabel } from "@/lib/utils";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function TasksTable() {
  const [tasks, setTasks] = useState(mockTasks);

  function toggleTaskComplete(taskId: number) {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, isCompleted: !t.isCompleted, status: !t.isCompleted ? "completed" : "to_do" as "completed" | "to_do" | "in_progress" | "cancelled" }
          : t
      )
    );
    const task = tasks.find((t) => t.id === taskId);
    if (task && !task.isCompleted) {
      toast.success("Task marked as complete!");
    }
  }

  return (
    <Card className="overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/50">
            {["", "Task Detail", "Due Date", "Priority", "Status", "Assigned To"].map((h, i) => (
              <th
                key={i}
                className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {tasks.map((task) => {
            const priorityVariant = task.priority as "high" | "medium" | "low";
            const statusMap: Record<string, "to_do" | "in_progress_task" | "completed" | "cancelled"> = {
              to_do: "to_do",
              in_progress: "in_progress_task",
              completed: "completed",
              cancelled: "cancelled",
            };

            return (
              <tr key={task.id} className="group hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-4 w-10">
                  <button
                    onClick={() => toggleTaskComplete(task.id)}
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all",
                      task.isCompleted
                        ? "bg-indigo-600 border-indigo-600"
                        : "border-gray-300 hover:border-indigo-400"
                    )}
                  >
                    {task.isCompleted && <Check className="h-3 w-3 text-white" />}
                  </button>
                </td>
                <td className="px-4 py-4">
                  <p className={cn(
                    "text-sm font-medium text-gray-900",
                    task.isCompleted && "line-through text-gray-400"
                  )}>
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[200px]">{task.description}</p>
                  )}
                </td>
                <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                  {task.dueDate ? formatDate(task.dueDate) : "—"}
                </td>
                <td className="px-4 py-4">
                  <Badge className={`text-[10px] font-bold uppercase ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </Badge>
                </td>
                <td className="px-4 py-4">
                  <Badge variant={statusMap[task.status] || "to_do"}>
                    {formatStatusLabel(task.status)}
                  </Badge>
                </td>
                <td className="px-4 py-4">
                  {task.assignedTo ? (
                    <div className="flex items-center gap-1">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className={`text-[10px] font-bold text-white bg-indigo-600`}>
                          {task.assignedTo.initials}
                        </AvatarFallback>
                      </Avatar>
                      {"assignedTo2" in task && (task as {assignedTo2?: {initials: string}}).assignedTo2 && (
                        <Avatar className="h-6 w-6 -ml-1.5">
                          <AvatarFallback className="text-[10px] font-bold text-white bg-slate-500">
                            {(task as {assignedTo2?: {initials: string}}).assignedTo2?.initials}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}
