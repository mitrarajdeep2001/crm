import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const highActivityLeads = [
  { name: "Alexandra V.", initials: "AV", color: "bg-indigo-600" },
  { name: "Bradley H.", initials: "BH", color: "bg-emerald-500" },
  { name: "Elena R.", initials: "ER", color: "bg-rose-500" },
  { name: "Rachel K.", initials: "RK", color: "bg-amber-500" },
];

export function LeadHealth() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">Lead Health</p>
          <h3 className="text-lg font-bold text-gray-900">High Activity Accounts</h3>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {highActivityLeads.map((lead) => (
              <Avatar key={lead.name} className="h-8 w-8 ring-2 ring-white">
                <AvatarFallback className={`${lead.color} text-white text-xs font-bold`}>
                  {lead.initials}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 ring-2 ring-white">
            <span className="text-xs font-bold text-indigo-700">+4</span>
          </div>
        </div>
        <p className="mt-3 text-xs text-gray-500">
          8 high-priority accounts showing strong engagement signals in the last 7 days.
        </p>
      </CardContent>
    </Card>
  );
}
