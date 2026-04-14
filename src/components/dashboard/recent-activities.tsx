import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { mockActivities } from "@/lib/data/mock";
import { Mail, RefreshCw, UserPlus, Phone, CheckCircle } from "lucide-react";

const activityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  email_received: Mail,
  email_sent: Mail,
  deal_stage_changed: RefreshCw,
  lead_created: UserPlus,
  meeting_scheduled: Phone,
  task_completed: CheckCircle,
};

const activityColors: Record<string, string> = {
  email_received: "bg-blue-100 text-blue-600",
  email_sent: "bg-blue-100 text-blue-600",
  deal_stage_changed: "bg-orange-100 text-orange-600",
  lead_created: "bg-green-100 text-green-600",
  meeting_scheduled: "bg-purple-100 text-purple-600",
  task_completed: "bg-teal-100 text-teal-600",
};

export function RecentActivities() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">Recent Activities</h3>
          <Link href="/tasks" className="text-xs font-medium text-indigo-600 hover:text-indigo-700">
            View All
          </Link>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-0">
          {mockActivities.map((activity, idx) => {
            const Icon = activityIcons[activity.type] || Mail;
            const colorClass = activityColors[activity.type] || "bg-gray-100 text-gray-600";
            const isLast = idx === mockActivities.length - 1;
            return (
              <div key={activity.id} className="relative flex gap-3 pb-4">
                {/* Timeline line */}
                {!isLast && (
                  <div className="absolute left-4 top-9 bottom-0 w-px bg-gray-100" />
                )}
                {/* Icon */}
                <div className={`relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${colorClass}`}>
                  <Icon className="h-4 w-4" />
                </div>
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{activity.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{activity.description}</p>
                  {activity.type === "deal_stage_changed" && (
                    <span className="inline-block text-xs font-semibold text-indigo-600 mt-0.5">
                      Negotiation
                    </span>
                  )}
                  <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400 mt-1">
                    {activity.timeAgo}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
