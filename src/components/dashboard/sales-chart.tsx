"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { salesChartData } from "@/lib/data/mock";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const CustomTooltip = ({ active, payload, label }: {active?: boolean; payload?: Array<{name: string; value: number; color: string}>; label?: string}) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-lg text-sm">
        <p className="font-semibold text-gray-700 mb-2">{label}</p>
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-gray-500">{entry.name}:</span>
            <span className="font-semibold text-gray-900">
              ${(entry.value / 1000).toFixed(0)}K
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function SalesChart() {
  return (
    <Card className="p-0">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Sales Over Time</CardTitle>
            <CardDescription>Monthly revenue progression</CardDescription>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-indigo-600" />
              <span>Current Year</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-slate-200" />
              <span>Previous Year</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-72 pt-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={salesChartData}
            barSize={22}
            barGap={4}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f1f5f9"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 500 }}
            />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8faff" }} />
            <Bar
              dataKey="currentYear"
              name="Current Year"
              fill="#4f46e5"
              radius={[6, 6, 0, 0]}
            />
            <Bar
              dataKey="previousYear"
              name="Previous Year"
              fill="#e0e7ff"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
