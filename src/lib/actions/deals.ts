"use server";

import { revalidatePath } from "next/cache";
import { mockDeals } from "@/lib/data/mock";

let dealsStore = [...mockDeals];

export async function createDealAction(formData: FormData) {
  const title = formData.get("title") as string;
  const value = formData.get("value") as string;

  if (!title || !value) {
    return { error: "Title and value are required" };
  }

  const newDeal = {
    id: dealsStore.length + 1,
    title,
    company: formData.get("company") as string || "",
    value,
    stage: (formData.get("stage") as "lead" | "qualified" | "proposal" | "negotiation" | "won" | "lost") || "lead",
    priority: (formData.get("priority") as "low" | "medium" | "high") || "medium",
    assignedToId: null,
    assignedTo: null,
    leadId: null,
    description: formData.get("description") as string || "",
    attachments: [] as string[],
    closingDate: new Date(),
    createdAt: new Date(),
  };

  dealsStore.push(newDeal as typeof dealsStore[0]);
  revalidatePath("/deals");
  return { success: true, deal: newDeal };
}

export async function updateDealStageAction(id: number, stage: string) {
  const idx = dealsStore.findIndex((d) => d.id === id);
  if (idx === -1) return { error: "Deal not found" };

  dealsStore[idx] = {
    ...dealsStore[idx],
    stage: stage as "lead" | "qualified" | "proposal" | "negotiation" | "won" | "lost",
  };

  revalidatePath("/deals");
  return { success: true };
}

export async function deleteDealAction(id: number) {
  dealsStore = dealsStore.filter((d) => d.id !== id);
  revalidatePath("/deals");
  return { success: true };
}
