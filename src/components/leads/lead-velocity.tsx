"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from "recharts";

const velocityData = [
  { week: "W1", leads: 8 },
  { week: "W2", leads: 14 },
  { week: "W3", leads: 11 },
  { week: "W4", leads: 7 },
  { week: "W5", leads: 15 },
  { week: "W6", leads: 9 },
  { week: "W7", leads: 18 },
  { week: "W8", leads: 13 },
];

export function LeadVelocity() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Lead Velocity</CardTitle>
        <CardDescription>Performance metrics for the last 30 days.</CardDescription>
      </CardHeader>
      <CardContent className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={velocityData} barSize={24}>
            <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
            <Tooltip
              contentStyle={{ borderRadius: "12px", border: "1px solid #f1f5f9", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}
              cursor={{ fill: "#f8faff" }}
            />
            <Bar dataKey="leads" fill="#c7d2fe" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
