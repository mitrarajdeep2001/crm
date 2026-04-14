import { TrendingUp, TrendingDown, Users, Briefcase, DollarSign, Percent } from "lucide-react";
import { Card } from "@/components/ui/card";
import { kpiData } from "@/lib/data/mock";

const kpiCards = [
  {
    key: "totalLeads",
    label: "Total Leads",
    icon: Users,
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
    value: "1,482",
    change: 12,
    isPositive: true,
  },
  {
    key: "activeDeals",
    label: "Active Deals",
    icon: Briefcase,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    value: "64",
    change: 8,
    isPositive: true,
  },
  {
    key: "revenue",
    label: "Revenue",
    icon: DollarSign,
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    value: "$2.4M",
    change: 24,
    isPositive: true,
  },
  {
    key: "conversionRate",
    label: "Conversion Rate",
    icon: Percent,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    value: "3.8%",
    change: 2,
    isPositive: false,
  },
];

export function KPICards() {
  return (
    <div className="grid grid-cols-4 gap-4">
      {kpiCards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.key} className="p-5 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start justify-between mb-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.iconBg}`}>
                <Icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-semibold ${card.isPositive ? "text-emerald-600" : "text-red-500"}`}>
                {card.isPositive ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5" />
                )}
                {card.isPositive ? "+" : "-"}{card.change}%
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                {card.label}
              </p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
