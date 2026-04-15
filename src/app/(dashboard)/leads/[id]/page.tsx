import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { leads, users } from "@/lib/db/schema";
import { getInitials } from "@/lib/utils";
import { LeadDetail } from "@/components/leads/lead-detail";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function LeadDetailPage({ params }: Props) {
  const { id } = await params;
  const leadId = Number(id);
  if (!Number.isInteger(leadId) || leadId <= 0) {
    notFound();
  }

  const [leadRows, assignees] = await Promise.all([
    db
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
      .limit(1),
    db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
      })
      .from(users)
      .orderBy(asc(users.name)),
  ]);

  const lead = leadRows[0];

  if (!lead) {
    notFound();
  }

  return (
    <LeadDetail
      lead={{
        id: lead.id,
        leadId: lead.leadId,
        firstName: lead.firstName,
        lastName: lead.lastName,
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        jobTitle: lead.jobTitle,
        status: lead.status,
        source: lead.source,
        assignedToId: lead.assignedToId,
        assignedTo: lead.assignedToName
          ? {
              name: lead.assignedToName,
              email: lead.assignedToEmail,
              initials: getInitials(lead.assignedToName),
            }
          : null,
        projectedValue: lead.projectedValue,
        winProbability: lead.winProbability,
        timezone: lead.timezone,
        notes: lead.notes,
        createdAt: lead.createdAt,
        updatedAt: lead.updatedAt,
      }}
      assignees={assignees}
    />
  );
}
