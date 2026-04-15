"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate, formatStatusLabel } from "@/lib/utils";
import { toast } from "sonner";

export type LeadDetail = {
  id: number;
  leadId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  company: string | null;
  jobTitle: string | null;
  status: "new_lead" | "qualified" | "in_progress" | "lost" | "converted";
  source: "linkedin_ads" | "direct_referral" | "conference" | "webinar" | "organic_search" | "cold_outreach" | "partner" | "other";
  assignedToId: number | null;
  assignedTo: { name: string; initials: string; email?: string | null } | null;
  projectedValue: string | null;
  winProbability: number | null;
  timezone: string | null;
  notes: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

interface LeadDetailProps {
  lead: LeadDetail;
  assignees: Array<{ id: number; name: string; email: string }>;
}

const UNASSIGNED_VALUE = "__unassigned__";

export function LeadDetail({ lead, assignees }: LeadDetailProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: lead.firstName,
    lastName: lead.lastName,
    email: lead.email,
    phone: lead.phone ?? "",
    company: lead.company ?? "",
    jobTitle: lead.jobTitle ?? "",
    status: lead.status,
    source: lead.source,
    assignedToId: lead.assignedToId ? String(lead.assignedToId) : UNASSIGNED_VALUE,
    projectedValue: lead.projectedValue ?? "",
    winProbability: lead.winProbability === null ? "" : String(lead.winProbability),
    timezone: lead.timezone ?? "",
    notes: lead.notes ?? "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const statusVariant = {
    qualified: "qualified",
    new_lead: "new_lead",
    in_progress: "in_progress",
    lost: "lost",
    converted: "converted",
  }[form.status] as "qualified" | "new_lead" | "in_progress" | "lost" | "converted" | "default";

  async function saveLead() {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      toast.error("First name, last name, and email are required");
      return;
    }

    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      company: form.company.trim(),
      jobTitle: form.jobTitle.trim(),
      status: form.status,
      source: form.source,
      assignedToId: form.assignedToId === UNASSIGNED_VALUE ? null : Number(form.assignedToId),
      projectedValue: form.projectedValue.trim(),
      winProbability: form.winProbability.trim(),
      timezone: form.timezone.trim(),
      notes: form.notes,
    };

    setIsSaving(true);
    try {
      const response = await fetch(`/api/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        toast.error(data.error || "Failed to update lead");
        return;
      }

      toast.success("Lead updated");
      router.refresh();
    } catch {
      toast.error("Failed to update lead");
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteLead() {
    const confirmed = window.confirm("Delete this lead permanently?");
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/leads/${lead.id}`, { method: "DELETE" });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        toast.error(data.error || "Failed to delete lead");
        return;
      }

      toast.success("Lead deleted");
      router.push("/leads");
      router.refresh();
    } catch {
      toast.error("Failed to delete lead");
    } finally {
      setIsDeleting(false);
    }
  }

  const assigneeOptions = [...assignees];
  if (
    lead.assignedToId &&
    lead.assignedTo &&
    !assigneeOptions.some((assignee) => assignee.id === lead.assignedToId)
  ) {
    assigneeOptions.push({
      id: lead.assignedToId,
      name: lead.assignedTo.name,
      email: lead.assignedTo.email ?? "",
    });
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Badge variant={statusVariant} className="text-xs font-bold uppercase tracking-wider px-3 py-1">
              {formatStatusLabel(form.status)}
            </Badge>
            <span className="text-sm font-medium text-gray-400">{lead.leadId}</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {form.firstName || "No first name"} {form.lastName || "No last name"}
          </h1>
          <p className="text-sm text-gray-500">
            {form.jobTitle || "No title"} at{" "}
            <span className="font-semibold text-gray-700">{form.company || "No company"}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={saveLead} disabled={isSaving} className="gap-2">
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
          <Button variant="outline" className="gap-2 text-red-600" onClick={deleteLead} disabled={isDeleting}>
            <Trash2 className="h-4 w-4" />
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card className="col-span-2 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Lead Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">First Name</label>
              <Input
                value={form.firstName}
                onChange={(event) => setForm((current) => ({ ...current, firstName: event.target.value }))}
                placeholder="First name"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Name</label>
              <Input
                value={form.lastName}
                onChange={(event) => setForm((current) => ({ ...current, lastName: event.target.value }))}
                placeholder="Last name"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</label>
              <Input
                type="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                placeholder="name@company.com"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</label>
              <Input
                value={form.phone}
                onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                placeholder="+1 555 000 0000"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Company</label>
              <Input
                value={form.company}
                onChange={(event) => setForm((current) => ({ ...current, company: event.target.value }))}
                placeholder="Company"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Job Title</label>
              <Input
                value={form.jobTitle}
                onChange={(event) => setForm((current) => ({ ...current, jobTitle: event.target.value }))}
                placeholder="Job title"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</label>
              <Select
                value={form.status}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    status: value as LeadDetail["status"],
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new_lead">New Lead</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Source</label>
              <Select
                value={form.source}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    source: value as LeadDetail["source"],
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="linkedin_ads">LinkedIn Ads</SelectItem>
                  <SelectItem value="direct_referral">Direct Referral</SelectItem>
                  <SelectItem value="conference">Conference</SelectItem>
                  <SelectItem value="webinar">Webinar</SelectItem>
                  <SelectItem value="organic_search">Organic Search</SelectItem>
                  <SelectItem value="cold_outreach">Cold Outreach</SelectItem>
                  <SelectItem value="partner">Partner</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned To</label>
              <Select
                value={form.assignedToId}
                onValueChange={(value) => setForm((current) => ({ ...current, assignedToId: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNASSIGNED_VALUE}>Unassigned</SelectItem>
                  {assigneeOptions.map((assignee) => (
                    <SelectItem key={assignee.id} value={String(assignee.id)}>
                      {assignee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Timezone</label>
              <Input
                value={form.timezone}
                onChange={(event) => setForm((current) => ({ ...current, timezone: event.target.value }))}
                placeholder="e.g. America/New_York"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Projected Value</label>
              <Input
                value={form.projectedValue}
                onChange={(event) => setForm((current) => ({ ...current, projectedValue: event.target.value }))}
                placeholder="e.g. 25000.00"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Win Probability (%)</label>
              <Input
                type="number"
                min={0}
                max={100}
                value={form.winProbability}
                onChange={(event) => setForm((current) => ({ ...current, winProbability: event.target.value }))}
                placeholder="0 - 100"
              />
            </div>
            <div className="col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Notes</label>
              <textarea
                value={form.notes}
                onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                rows={8}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Add internal notes..."
              />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Meta</h3>
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Lead ID</p>
              <p className="text-sm text-gray-700">{lead.leadId}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Created</p>
              <p className="text-sm text-gray-700">{formatDate(lead.createdAt)}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Last Updated</p>
              <p className="text-sm text-gray-700">{formatDate(lead.updatedAt)}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
