"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { leads } from "@/lib/db/schema";
import { createLeadSchema, updateLeadSchema } from "@/lib/validators";
import { getSessionUser } from "@/lib/auth/session";

async function generateLeadId() {
  for (let i = 0; i < 8; i += 1) {
    const candidate = `L-${Math.floor(100000 + Math.random() * 900000)}`;
    const [existing] = await db
      .select({ id: leads.id })
      .from(leads)
      .where(eq(leads.leadId, candidate))
      .limit(1);

    if (!existing) {
      return candidate;
    }
  }

  return `L-${Date.now().toString().slice(-8)}`;
}

export async function createLeadAction(formData: FormData) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return { error: "Unauthorized" };
  }

  const parsed = createLeadSchema.safeParse({
    firstName: (formData.get("firstName") as string | null)?.trim(),
    lastName: (formData.get("lastName") as string | null)?.trim(),
    email: (formData.get("email") as string | null)?.trim(),
    phone: (formData.get("phone") as string | null)?.trim() || undefined,
    company: (formData.get("company") as string | null)?.trim() || undefined,
    jobTitle: (formData.get("jobTitle") as string | null)?.trim() || undefined,
    status: (formData.get("status") as string | null) || "new_lead",
    source: (formData.get("source") as string | null) || "other",
    projectedValue: (formData.get("projectedValue") as string | null)?.trim() || undefined,
    timezone: (formData.get("timezone") as string | null)?.trim() || undefined,
    notes: (formData.get("notes") as string | null)?.trim() || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid lead data" };
  }

  const leadId = await generateLeadId();

  const [lead] = await db
    .insert(leads)
    .values({
      leadId,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email: parsed.data.email.toLowerCase(),
      phone: parsed.data.phone ?? null,
      company: parsed.data.company ?? null,
      jobTitle: parsed.data.jobTitle ?? null,
      status: parsed.data.status,
      source: parsed.data.source,
      assignedToId: sessionUser.id,
      projectedValue: parsed.data.projectedValue ?? null,
      timezone: parsed.data.timezone ?? null,
      notes: parsed.data.notes ?? null,
    })
    .returning({
      id: leads.id,
      leadId: leads.leadId,
      firstName: leads.firstName,
      lastName: leads.lastName,
      email: leads.email,
      status: leads.status,
      source: leads.source,
      createdAt: leads.createdAt,
    });

  revalidatePath("/leads");
  return { success: true, lead };
}

export async function updateLeadAction(id: number, formData: FormData) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return { error: "Unauthorized" };
  }

  const parsed = updateLeadSchema.safeParse({
    firstName: (formData.get("firstName") as string | null)?.trim() || undefined,
    lastName: (formData.get("lastName") as string | null)?.trim() || undefined,
    email: (formData.get("email") as string | null)?.trim() || undefined,
    phone: (formData.get("phone") as string | null)?.trim() || undefined,
    company: (formData.get("company") as string | null)?.trim() || undefined,
    jobTitle: (formData.get("jobTitle") as string | null)?.trim() || undefined,
    status: (formData.get("status") as string | null) || undefined,
    source: (formData.get("source") as string | null) || undefined,
    projectedValue: (formData.get("projectedValue") as string | null)?.trim() || undefined,
    timezone: (formData.get("timezone") as string | null)?.trim() || undefined,
    notes: (formData.get("notes") as string | null)?.trim() || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid update payload" };
  }

  const entries = Object.entries(parsed.data).filter(([, value]) => value !== undefined);
  if (entries.length === 0) {
    return { error: "No fields to update" };
  }

  const updateData: Record<string, unknown> = {};
  for (const [key, value] of entries) {
    if (key === "email" && typeof value === "string") {
      updateData.email = value.toLowerCase();
      continue;
    }
    updateData[key] = value;
  }
  updateData.updatedAt = new Date();

  const [updatedLead] = await db
    .update(leads)
    .set(updateData)
    .where(eq(leads.id, id))
    .returning({ id: leads.id });

  if (!updatedLead) {
    return { error: "Lead not found" };
  }

  revalidatePath("/leads");
  revalidatePath(`/leads/${id}`);
  return { success: true };
}

export async function deleteLeadAction(id: number) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return { error: "Unauthorized" };
  }

  const [deletedLead] = await db
    .delete(leads)
    .where(eq(leads.id, id))
    .returning({ id: leads.id });

  if (!deletedLead) {
    return { error: "Lead not found" };
  }

  revalidatePath("/leads");
  return { success: true };
}
