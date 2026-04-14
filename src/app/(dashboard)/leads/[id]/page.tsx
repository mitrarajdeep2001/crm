import { notFound } from "next/navigation";
import { mockLeads, mockLeadTimeline } from "@/lib/data/mock";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Pencil,
  Rocket,
  Mail,
  Phone,
  Globe,
  Clock,
  User,
  Phone as PhoneIcon,
  ChevronRight,
  TrendingUp,
  MapPin,
} from "lucide-react";
import { formatStatusLabel, formatSourceLabel, formatCurrency } from "@/lib/utils";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function LeadDetailPage({ params }: Props) {
  const { id } = await params;
  const lead = mockLeads.find((l) => l.id === parseInt(id));
  if (!lead) notFound();

  const timeline = mockLeadTimeline;

  const statusVariant = {
    qualified: "qualified",
    new_lead: "new_lead",
    in_progress: "in_progress",
    lost: "lost",
    converted: "converted",
  }[lead.status] as "qualified" | "new_lead" | "in_progress" | "lost" | "converted" | "default";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Badge variant={statusVariant || "default"} className="text-xs font-bold uppercase tracking-wider px-3 py-1">
              {formatStatusLabel(lead.status)}
            </Badge>
            <span className="text-sm font-medium text-gray-400">{lead.leadId}</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {lead.firstName} {lead.lastName}
          </h1>
          <p className="text-sm text-gray-500">
            {lead.jobTitle} at{" "}
            <span className="font-semibold text-gray-700">{lead.company}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Pencil className="h-4 w-4" />
            Edit Lead
          </Button>
          <Button className="gap-2">
            <Rocket className="h-4 w-4" />
            Convert to Deal
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left: Timeline */}
        <div className="col-span-1">
          <Card className="p-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
              Engagement Timeline
            </h3>
            <div className="space-y-0">
              {timeline.map((event, idx) => (
                <div key={event.id} className="relative flex gap-3 pb-5">
                  {idx < timeline.length - 1 && (
                    <div className="absolute left-2.5 top-5 bottom-0 w-px bg-gray-100" />
                  )}
                  <div className={`relative flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 mt-0.5 ${
                    event.isToday ? "border-indigo-500 bg-indigo-500" : "border-gray-200 bg-white"
                  }`}>
                    <div className={`h-1.5 w-1.5 rounded-full ${event.isToday ? "bg-white" : "bg-gray-400"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">
                      {event.date}
                    </p>
                    <p className="text-sm font-semibold text-gray-900">{event.title}</p>
                    <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mt-2">
              View Full History
              <ChevronRight className="h-4 w-4" />
            </button>
          </Card>
        </div>

        {/* Center: Notes */}
        <div className="col-span-1">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Internal Strategy Notes</h3>
              <div className="flex items-center gap-1">
                <button className="h-7 w-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 font-bold text-sm">B</button>
                <button className="h-7 w-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 italic text-sm">I</button>
                <button className="h-7 w-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 text-sm">≡</button>
              </div>
            </div>
            <div className="prose prose-sm max-w-none text-gray-600 space-y-3 text-sm leading-relaxed">
              <p>
                Alexandra is currently evaluating three different vendors. Vanguard&apos;s primary pain point is the
                manual reconciliation of cross-border shipments which takes their team ~40 hours per week.
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li><strong>Key Decision Maker:</strong> Alexandra V.</li>
                <li><strong>Influencer:</strong> Michael Chen (CTO)</li>
                <li><strong>Budget:</strong> Approved for Enterprise Tier</li>
                <li><strong>Timeline:</strong> Seeking migration by early Q1</li>
              </ul>
              <blockquote className="rounded-lg border-l-4 border-indigo-500 bg-indigo-50 px-4 py-3 italic text-indigo-700">
                &ldquo;We need a solution that isn&apos;t just a database, but an intelligence layer for our supply chain.&rdquo; — Direct Quote from Call
              </blockquote>
              <p>
                Focus future demos on the <strong>AI Predictive Logistics</strong> dashboard. They specifically
                mentioned interest in the automation triggers for customs clearance.
              </p>
            </div>
            <Separator className="my-4" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1.5">
                  {["AR", "JD"].map((init) => (
                    <Avatar key={init} className="h-6 w-6 ring-2 ring-white">
                      <AvatarFallback className="bg-indigo-600 text-white text-[10px] font-bold">
                        {init}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 ring-2 ring-white text-[10px] font-bold text-gray-500">
                    +2
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-400">Last updated 2 hours ago by Jordan D.</p>
            </div>
          </Card>
        </div>

        {/* Right: Details */}
        <div className="col-span-1 space-y-4">
          {/* Lead Details Card */}
          <Card className="p-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
              Lead Details
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Direct Email</p>
                  <a href={`mailto:${lead.email}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                    {lead.email}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Office Phone</p>
                  <p className="text-sm text-gray-700">{lead.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Globe className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Lead Source</p>
                  <p className="text-sm text-gray-700">{formatSourceLabel(lead.source)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Timezone</p>
                  <p className="text-sm text-gray-700">{lead.timezone}</p>
                </div>
              </div>
              {lead.assignedTo && (
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Account Manager</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-indigo-600 text-white text-[10px] font-bold">
                          {lead.assignedTo.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-700">{lead.assignedTo.name}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Management Card */}
          <Card className="p-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
              Management
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">
                  Lead Status
                </label>
                <div className="flex h-10 w-full items-center justify-between rounded-xl border border-gray-200 px-3 text-sm text-gray-700">
                  {formatStatusLabel(lead.status)}
                  <ChevronRight className="h-4 w-4 rotate-90 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">
                  Reassign To
                </label>
                <div className="flex h-10 w-full items-center justify-between rounded-xl border border-gray-200 px-3 text-sm text-gray-700">
                  {lead.assignedTo?.name || "Unassigned"}
                  <ChevronRight className="h-4 w-4 rotate-90 text-gray-400" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <PhoneIcon className="h-3.5 w-3.5" />
                  Log Call
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  Email
                </Button>
              </div>
            </div>
          </Card>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <TrendingUp className="h-4 w-4 text-indigo-600" />
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Projected Value</p>
              </div>
              <p className="text-xl font-bold text-gray-900">
                {lead.projectedValue ? formatCurrency(parseFloat(lead.projectedValue)) : "N/A"}
                <span className="text-xs font-normal text-gray-400">/yr</span>
              </p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Win Probability</p>
              </div>
              <p className="text-xl font-bold text-gray-900">{lead.winProbability}%</p>
            </Card>
          </div>

          {/* Map placeholder */}
          <div className="relative overflow-hidden rounded-2xl bg-slate-800 h-28 flex items-end p-3">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900 opacity-80" />
            <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 gap-0.5 opacity-20">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="border border-slate-600" />
              ))}
            </div>
            <div className="relative z-10">
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-300">Headquarters</p>
              <p className="text-xs font-semibold text-white flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Midtown Manhattan, NY
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
