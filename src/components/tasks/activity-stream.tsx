import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { mockActivityStream } from "@/lib/data/mock";
import { Mail, Phone, CalendarDays, Eye } from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  email_sent: Mail,
  email_received: Mail,
  call_made: Phone,
  call_received: Phone,
  meeting_scheduled: CalendarDays,
  inbound_form: Eye,
};

const labelColorMap: Record<string, string> = {
  blue: "bg-blue-100 text-blue-700",
  green: "bg-green-100 text-green-700",
  orange: "bg-orange-100 text-orange-700",
  purple: "bg-purple-100 text-purple-700",
};

const iconBgMap: Record<string, string> = {
  email_sent: "bg-blue-100 text-blue-600",
  email_received: "bg-blue-100 text-blue-600",
  call_made: "bg-teal-100 text-teal-600",
  meeting_scheduled: "bg-orange-100 text-orange-600",
  inbound_form: "bg-purple-100 text-purple-600",
};

export function ActivityStream() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">Activity Stream</h3>
          <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">FILTER</button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {mockActivityStream.map((activity, idx) => {
            const Icon = iconMap[activity.type] || Mail;
            const iconBg = iconBgMap[activity.type] || "bg-gray-100 text-gray-600";
            const labelColor = labelColorMap[activity.labelColor] || "bg-gray-100 text-gray-600";
            const isLast = idx === mockActivityStream.length - 1;

            return (
              <div key={activity.id} className="relative flex gap-3">
                {!isLast && (
                  <div className="absolute left-4 top-9 bottom-0 w-px bg-gray-100" />
                )}
                <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${iconBg}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0 pb-4">
                  <p className="text-sm text-gray-700 leading-snug">
                    <span className="font-semibold">{activity.user}</span>{" "}
                    {activity.action}{" "}
                    {activity.target && (
                      <a href={activity.targetHref} className="font-semibold text-indigo-600 hover:underline">
                        {activity.target}.
                      </a>
                    )}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[11px] text-gray-400">{activity.time}</span>
                    <span className="text-gray-300">•</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${labelColor}`}>
                      {activity.label}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <button className="mt-2 w-full rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
          View History Analysis
        </button>
      </CardContent>
    </Card>
  );
}
