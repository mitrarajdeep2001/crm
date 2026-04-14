import { NextRequest, NextResponse } from "next/server";
import { mockLeads } from "@/lib/data/mock";

const leadsStore = [...mockLeads];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  let filtered = leadsStore;

  if (status) {
    filtered = filtered.filter((l) => l.status === status);
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (l) =>
        l.firstName.toLowerCase().includes(q) ||
        l.lastName.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.company?.toLowerCase().includes(q)
    );
  }

  const total = filtered.length;
  const data = filtered.slice((page - 1) * limit, page * limit);

  return NextResponse.json({
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;

  if (!firstName || !lastName || !email) {
    return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
  }

  const newLead = {
    id: leadsStore.length + 1,
    leadId: `L-${90430 + leadsStore.length}`,
    firstName,
    lastName,
    email,
    phone: formData.get("phone") as string || "",
    company: formData.get("company") as string || "",
    jobTitle: formData.get("jobTitle") as string || "",
    status: (formData.get("status") as "new_lead" | "qualified" | "in_progress" | "lost" | "converted") || "new_lead",
    source: (formData.get("source") as "linkedin_ads" | "direct_referral" | "conference" | "webinar" | "organic_search" | "cold_outreach" | "partner" | "other") || "other",
    assignedToId: null,
    assignedTo: null,
    projectedValue: formData.get("projectedValue") as string || "0",
    winProbability: 0,
    timezone: "",
    notes: formData.get("notes") as string || "",
    createdAt: new Date(),
  };

  leadsStore.push(newLead as typeof leadsStore[0]);
  return NextResponse.json(newLead, { status: 201 });
}
