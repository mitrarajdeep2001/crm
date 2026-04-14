"use server";

import { revalidatePath } from "next/cache";
import { mockTasks } from "@/lib/data/mock";

let tasksStore = [...mockTasks];

export async function createTaskAction(formData: FormData) {
  const title = formData.get("title") as string;
  if (!title) return { error: "Title is required" };

  const newTask = {
    id: tasksStore.length + 1,
    title,
    description: formData.get("description") as string || "",
    dueDate: formData.get("dueDate") ? new Date(formData.get("dueDate") as string) : null,
    priority: (formData.get("priority") as "low" | "medium" | "high") || "medium",
    status: (formData.get("status") as "to_do" | "in_progress" | "completed" | "cancelled") || "to_do",
    assignedToId: null,
    assignedTo: null,
    leadId: null,
    dealId: null,
    isCompleted: false,
    createdAt: new Date(),
  };

  tasksStore.push(newTask as typeof tasksStore[0]);
  revalidatePath("/tasks");
  return { success: true, task: newTask };
}

export async function updateTaskStatusAction(id: number, status: string) {
  const idx = tasksStore.findIndex((t) => t.id === id);
  if (idx === -1) return { error: "Task not found" };

  tasksStore[idx] = {
    ...tasksStore[idx],
    status: status as "to_do" | "in_progress" | "completed" | "cancelled",
    isCompleted: status === "completed",
  };

  revalidatePath("/tasks");
  return { success: true };
}

export async function deleteTaskAction(id: number) {
  tasksStore = tasksStore.filter((t) => t.id !== id);
  revalidatePath("/tasks");
  return { success: true };
}
