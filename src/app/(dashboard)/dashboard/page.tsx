import { Suspense } from "react";
import { KPICards } from "@/components/dashboard/kpi-cards";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { RecentActivities } from "@/components/dashboard/recent-activities";
import { DealsPipeline } from "@/components/dashboard/deals-pipeline";
import { LeadHealth } from "@/components/dashboard/lead-health";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Workspace Overview</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back, Curator. Here&apos;s your sales performance for the month.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2">
            <CalendarDays className="h-4 w-4" />
            Last 30 Days
          </Button>
          <Button size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <Suspense fallback={<div className="grid grid-cols-4 gap-4"><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" /></div>}>
        <KPICards />
      </Suspense>

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Suspense fallback={<Skeleton className="h-80" />}>
            <SalesChart />
          </Suspense>
        </div>
        <div>
          <Suspense fallback={<Skeleton className="h-80" />}>
            <RecentActivities />
          </Suspense>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <DealsPipeline />
        </div>
        <div>
          <LeadHealth />
        </div>
      </div>
    </div>
  );
}
