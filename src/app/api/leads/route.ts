import { NextRequest, NextResponse } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { leads, users } from "@/lib/db/schema";
import { createLeadSchema } from "@/lib/validators";
import { getSessionUser } from "@/lib/auth/session";
import { getInitials } from "@/lib/utils";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;
type LeadStatus = "new_lead" | "qualified" | "in_progress" | "lost" | "converted";

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

function normalizeLeadPayload(input: Record<string, unknown>) {
  const toOptionalString = (key: string) => {
    const value = input[key];
    if (typeof value !== "string") return undefined;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  };

  const toOptionalNumber = (key: string) => {
    const value = input[key];
    if (typeof value === "number") {
      return Number.isFinite(value) ? value : undefined;
    }
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed.length === 0) return undefined;
      const parsed = Number(trimmed);
      return Number.isFinite(parsed) ? parsed : undefined;
    }
    return undefined;
  };

  const assignedToRaw = toOptionalNumber("assignedToId");
  const assignedToId =
    typeof assignedToRaw === "number"
      ? assignedToRaw
      : undefined;
  const winProbabilityRaw = toOptionalNumber("winProbability");
  const winProbability =
    typeof winProbabilityRaw === "number" ? Math.round(winProbabilityRaw) : undefined;

  const payload = {
    firstName: toOptionalString("firstName"),
    lastName: toOptionalString("lastName"),
    email: toOptionalString("email"),
    phone: toOptionalString("phone"),
    company: toOptionalString("company"),
    jobTitle: toOptionalString("jobTitle"),
    status: input.status,
    source: input.source,
    assignedToId: Number.isFinite(assignedToId) ? assignedToId : undefined,
    projectedValue: toOptionalString("projectedValue"),
    winProbability,
    timezone: toOptionalString("timezone"),
    notes: toOptionalString("notes"),
  };

  return createLeadSchema.safeParse(payload);
}

async function getBodyPayload(request: NextRequest) {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const json = (await request.json()) as Record<string, unknown>;
    return json;
  }

  const formData = await request.formData();
  const payload: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    payload[key] = typeof value === "string" ? value : value.name;
  }
  return payload;
}

export async function GET(request: NextRequest) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const pageRaw = Number(searchParams.get("page") || DEFAULT_PAGE);
  const limitRaw = Number(searchParams.get("limit") || DEFAULT_LIMIT);
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : DEFAULT_PAGE;
  const limit = Number.isFinite(limitRaw) && limitRaw > 0
    ? Math.min(MAX_LIMIT, Math.floor(limitRaw))
    : DEFAULT_LIMIT;
  const status = searchParams.get("status");
  const search = (searchParams.get("search") || "").trim().toLowerCase();

  const whereClauses = [];
  if (status && status !== "all") {
    whereClauses.push(eq(leads.status, status as LeadStatus));
  }
  if (search) {
    const searchPattern = `%${search}%`;
    whereClauses.push(
      sql`(
        lower(${leads.firstName}) like ${searchPattern}
        or lower(${leads.lastName}) like ${searchPattern}
        or lower(${leads.email}) like ${searchPattern}
        or lower(coalesce(${leads.company}, '')) like ${searchPattern}
      )`
    );
  }

  const whereCondition = whereClauses.length > 0 ? and(...whereClauses) : undefined;
  const offset = (page - 1) * limit;

  const leadsQuery = db
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
    .orderBy(sql`${leads.createdAt} desc`)
    .limit(limit)
    .offset(offset);

  const countQuery = db
    .select({
      count: sql<number>`count(*)::int`,
    })
    .from(leads);

  const [rows, [countRow]] = await Promise.all([
    whereCondition ? leadsQuery.where(whereCondition) : leadsQuery,
    whereCondition ? countQuery.where(whereCondition) : countQuery,
  ]);

  const data = rows.map((row) => ({
    id: row.id,
    leadId: row.leadId,
    firstName: row.firstName,
    lastName: row.lastName,
    email: row.email,
    phone: row.phone,
    company: row.company,
    jobTitle: row.jobTitle,
    status: row.status,
    source: row.source,
    assignedToId: row.assignedToId,
    assignedTo: row.assignedToName
      ? {
          name: row.assignedToName,
          email: row.assignedToEmail,
          initials: getInitials(row.assignedToName),
        }
      : null,
    projectedValue: row.projectedValue,
    winProbability: row.winProbability,
    timezone: row.timezone,
    notes: row.notes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }));

  const total = countRow?.count ?? 0;

  return NextResponse.json({
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}

export async function POST(request: NextRequest) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rawPayload = await getBodyPayload(request);
  const parsed = normalizeLeadPayload(rawPayload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const leadId = await generateLeadId();
  const [newLead] = await db
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
      assignedToId: parsed.data.assignedToId ?? sessionUser.id,
      projectedValue: parsed.data.projectedValue ?? null,
      winProbability: parsed.data.winProbability ?? null,
      timezone: parsed.data.timezone ?? null,
      notes: parsed.data.notes ?? null,
    })
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

  return NextResponse.json(newLead, { status: 201 });
}
