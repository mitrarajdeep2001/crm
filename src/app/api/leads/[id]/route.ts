import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { leads, users } from "@/lib/db/schema";
import { updateLeadSchema } from "@/lib/validators";
import { getSessionUser } from "@/lib/auth/session";
import { getInitials } from "@/lib/utils";

function parseId(id: string) {
  const parsed = Number(id);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function normalizePayload(input: Record<string, unknown>) {
  const toOptionalString = (key: string) => {
    if (!(key in input)) return undefined;
    const value = input[key];
    if (typeof value !== "string") return undefined;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : "";
  };

  const toOptionalNumber = (key: string) => {
    if (!(key in input)) return undefined;
    const value = input[key];
    if (typeof value === "number") {
      return Number.isFinite(value) ? value : undefined;
    }
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed.length === 0) return null;
      const parsed = Number(trimmed);
      return Number.isFinite(parsed) ? parsed : undefined;
    }
    if (value === null) return null;
    return undefined;
  };

  const assignedToRaw = toOptionalNumber("assignedToId");
  const assignedToId =
    assignedToRaw === null ? null : Number.isFinite(assignedToRaw) ? assignedToRaw : undefined;

  const winProbabilityRaw = toOptionalNumber("winProbability");
  const winProbability =
    winProbabilityRaw === null
      ? null
      : typeof winProbabilityRaw === "number"
      ? Math.round(winProbabilityRaw)
      : undefined;

  const payload = {
    firstName: toOptionalString("firstName"),
    lastName: toOptionalString("lastName"),
    email: toOptionalString("email"),
    phone: toOptionalString("phone"),
    company: toOptionalString("company"),
    jobTitle: toOptionalString("jobTitle"),
    status: input.status,
    source: input.source,
    assignedToId,
    projectedValue: toOptionalString("projectedValue"),
    winProbability,
    timezone: toOptionalString("timezone"),
    notes: toOptionalString("notes"),
  };

  return updateLeadSchema.safeParse(payload);
}

async function parseBody(request: NextRequest) {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return (await request.json()) as Record<string, unknown>;
  }

  const formData = await request.formData();
  const payload: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    payload[key] = typeof value === "string" ? value : value.name;
  }
  return payload;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const leadId = parseId(id);
  if (!leadId) {
    return NextResponse.json({ error: "Invalid lead id" }, { status: 400 });
  }

  const [lead] = await db
    .select({
      id: leads.id,
      leadId: leads.leadId,
      firstName: leads.firstName,
      lastName: leads.lastName,
      email: leads.email,
      phone: leads.phone,
      company: leads.company,
      jobTitle: leads.jobTitle,
      status: leads.status,
      source: leads.source,
      assignedToId: leads.assignedToId,
      projectedValue: leads.projectedValue,
      winProbability: leads.winProbability,
      timezone: leads.timezone,
      notes: leads.notes,
      createdAt: leads.createdAt,
      updatedAt: leads.updatedAt,
      assignedToName: users.name,
      assignedToEmail: users.email,
    })
    .from(leads)
    .leftJoin(users, eq(leads.assignedToId, users.id))
    .where(eq(leads.id, leadId))
    .limit(1);

  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  return NextResponse.json({
    data: {
      ...lead,
      assignedTo: lead.assignedToName
        ? {
            name: lead.assignedToName,
            email: lead.assignedToEmail,
            initials: getInitials(lead.assignedToName),
          }
        : null,
    },
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const leadId = parseId(id);
  if (!leadId) {
    return NextResponse.json({ error: "Invalid lead id" }, { status: 400 });
  }

  const rawPayload = await parseBody(request);
  const parsed = normalizePayload(rawPayload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const entries = Object.entries(parsed.data).filter(([, value]) => value !== undefined);
  if (entries.length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const updateData: Record<string, unknown> = {};
  for (const [key, value] of entries) {
    if (key === "email" && typeof value === "string") {
      updateData.email = value.toLowerCase();
      continue;
    }
    if (key === "projectedValue" && value === "") {
      updateData.projectedValue = null;
      continue;
    }
    updateData[key] = value === "" ? null : value;
  }
  updateData.updatedAt = new Date();

  const [updatedLead] = await db
    .update(leads)
    .set(updateData)
    .where(eq(leads.id, leadId))
    .returning({
      id: leads.id,
      leadId: leads.leadId,
      firstName: leads.firstName,
      lastName: leads.lastName,
      email: leads.email,
      phone: leads.phone,
      company: leads.company,
      jobTitle: leads.jobTitle,
      status: leads.status,
      source: leads.source,
      assignedToId: leads.assignedToId,
      projectedValue: leads.projectedValue,
      winProbability: leads.winProbability,
      timezone: leads.timezone,
      notes: leads.notes,
      createdAt: leads.createdAt,
      updatedAt: leads.updatedAt,
    });

  if (!updatedLead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: updatedLead });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const leadId = parseId(id);
  if (!leadId) {
    return NextResponse.json({ error: "Invalid lead id" }, { status: 400 });
  }

  const [deleted] = await db
    .delete(leads)
    .where(eq(leads.id, leadId))
    .returning({ id: leads.id });

  if (!deleted) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
