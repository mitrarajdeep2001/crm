"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";

type VelocityPoint = {
  date: string;
  label: string;
  leads: number;
};

type VelocityResponse = {
  total?: number;
  previousTotal?: number;
  changePercent?: number | null;
  data?: VelocityPoint[];
};

type VelocityTooltipProps = {
  active?: boolean;
  payload?: Array<{ value: number; payload: VelocityPoint }>;
};

function VelocityTooltip({ active, payload }: VelocityTooltipProps) {
  if (!active || !payload?.length) return null;

  const point = payload[0]?.payload;
  if (!point) return null;

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-3 text-sm shadow-lg">
      <p className="mb-1 font-semibold text-gray-800">{point.label}</p>
      <p className="text-gray-500">
        Leads: <span className="font-semibold text-gray-900">{point.leads}</span>
      </p>
    </div>
  );
}

export function LeadVelocity() {
  const [data, setData] = useState<VelocityPoint[]>([]);
  const [total, setTotal] = useState(0);
  const [previousTotal, setPreviousTotal] = useState(0);
  const [changePercent, setChangePercent] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadVelocity() {
      setIsLoading(true);
      try {
        const response = await fetch("/api/leads/velocity?days=30", {
          method: "GET",
          cache: "no-store",
        });
        const payload = (await response.json()) as VelocityResponse;

        if (!response.ok || !payload.data) {
          if (isMounted) {
            setData([]);
            setTotal(0);
            setPreviousTotal(0);
            setChangePercent(null);
          }
          return;
        }

        if (isMounted) {
          setData(payload.data);
          setTotal(payload.total ?? 0);
          setPreviousTotal(payload.previousTotal ?? 0);
          setChangePercent(payload.changePercent ?? null);
        }
      } catch {
        if (isMounted) {
          setData([]);
          setTotal(0);
          setPreviousTotal(0);
          setChangePercent(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    function handleLeadsChanged() {
      void loadVelocity();
    }

    window.addEventListener("leads:changed", handleLeadsChanged);
    void loadVelocity();
    return () => {
      isMounted = false;
      window.removeEventListener("leads:changed", handleLeadsChanged);
    };
  }, []);

  const comparisonText = changePercent === null
    ? `${previousTotal} leads in previous 30 days`
    : `${changePercent >= 0 ? "+" : ""}${changePercent}% vs previous 30 days`;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Lead Velocity</CardTitle>
        <CardDescription>{total} leads in the last 30 days. {comparisonText}.</CardDescription>
      </CardHeader>
      <CardContent className="h-56">
        {isLoading ? (
          <div className="flex h-full items-end gap-2">
            {Array.from({ length: 14 }, (_, index) => (
              <Skeleton
                key={`velocity-skeleton-${index}`}
                className="w-full rounded-md"
                style={{ height: `${40 + ((index * 17) % 45)}%` }}
              />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            No lead activity in the selected period.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 6, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="leadVelocityFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="label"
                interval="preserveStartEnd"
                minTickGap={18}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
              />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} width={30} tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <Tooltip content={<VelocityTooltip />} />
              <Area
                type="monotone"
                dataKey="leads"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#leadVelocityFill)"
                dot={false}
                activeDot={{ r: 4, fill: "#4f46e5" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
