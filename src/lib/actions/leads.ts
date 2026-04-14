"use server";

import { revalidatePath } from "next/cache";
import { mockLeads } from "@/lib/data/mock";

// In-memory store for demo (in production use DB)
let leadsStore = [...mockLeads];

export async function createLeadAction(formData: FormData) {
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const company = formData.get("company") as string;
  const status = (formData.get("status") as string) || "new_lead";
  const source = (formData.get("source") as string) || "other";

  if (!firstName || !lastName || !email) {
    return { error: "First name, last name, and email are required" };
  }

  const newLead = {
    id: leadsStore.length + 1,
    leadId: `L-${90430 + leadsStore.length}`,
    firstName,
    lastName,
    email,
    phone: formData.get("phone") as string || "",
    company: company || "",
    jobTitle: formData.get("jobTitle") as string || "",
    status: status as "new_lead" | "qualified" | "in_progress" | "lost" | "converted",
    source: source as "linkedin_ads" | "direct_referral" | "conference" | "webinar" | "organic_search" | "cold_outreach" | "partner" | "other",
    assignedToId: null,
    assignedTo: null,
    projectedValue: formData.get("projectedValue") as string || "0",
    winProbability: 0,
    timezone: "",
    notes: formData.get("notes") as string || "",
    createdAt: new Date(),
  };

  leadsStore.push(newLead as typeof leadsStore[0]);
  revalidatePath("/leads");
  return { success: true, lead: newLead };
}

export async function updateLeadAction(id: number, formData: FormData) {
  const idx = leadsStore.findIndex((l) => l.id === id);
  if (idx === -1) return { error: "Lead not found" };

  leadsStore[idx] = {
    ...leadsStore[idx],
    status: (formData.get("status") as "new_lead" | "qualified" | "in_progress" | "lost" | "converted") || leadsStore[idx].status,
    notes: (formData.get("notes") as string) || leadsStore[idx].notes,
  };

  revalidatePath("/leads");
  revalidatePath(`/leads/${id}`);
  return { success: true };
}

export async function deleteLeadAction(id: number) {
  leadsStore = leadsStore.filter((l) => l.id !== id);
  revalidatePath("/leads");
  return { success: true };
}
