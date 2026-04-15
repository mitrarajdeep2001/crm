import { NextRequest, NextResponse } from "next/server";
import { and, gte, lt, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { leads } from "@/lib/db/schema";
import { getSessionUser } from "@/lib/auth/session";

const DEFAULT_DAYS = 30;
const MIN_DAYS = 7;
const MAX_DAYS = 90;

function startOfUtcDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function clampDays(rawDays: string | null) {
  const parsed = Number(rawDays ?? DEFAULT_DAYS);
  if (!Number.isFinite(parsed)) return DEFAULT_DAYS;
  return Math.min(MAX_DAYS, Math.max(MIN_DAYS, Math.floor(parsed)));
}

export async function GET(request: NextRequest) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const days = clampDays(searchParams.get("days"));

  const today = startOfUtcDay(new Date());
  const tomorrow = new Date(today);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

  const currentPeriodStart = new Date(today);
  currentPeriodStart.setUTCDate(currentPeriodStart.getUTCDate() - (days - 1));

  const previousPeriodStart = new Date(currentPeriodStart);
  previousPeriodStart.setUTCDate(previousPeriodStart.getUTCDate() - days);

  const [dailyRows, [currentTotalRow], [previousTotalRow]] = await Promise.all([
    db
      .select({
        day: sql<string>`to_char(date_trunc('day', ${leads.createdAt}), 'YYYY-MM-DD')`,
        count: sql<number>`count(*)::int`,
      })
      .from(leads)
      .where(and(gte(leads.createdAt, currentPeriodStart), lt(leads.createdAt, tomorrow)))
      .groupBy(sql`date_trunc('day', ${leads.createdAt})`)
      .orderBy(sql`date_trunc('day', ${leads.createdAt})`),
    db
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(leads)
      .where(and(gte(leads.createdAt, currentPeriodStart), lt(leads.createdAt, tomorrow))),
    db
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(leads)
      .where(and(gte(leads.createdAt, previousPeriodStart), lt(leads.createdAt, currentPeriodStart))),
  ]);

  const countsByDay = new Map(dailyRows.map((row) => [row.day, row.count]));

  const data = Array.from({ length: days }, (_, index) => {
    const date = new Date(currentPeriodStart);
    date.setUTCDate(currentPeriodStart.getUTCDate() + index);
    const key = date.toISOString().slice(0, 10);

    return {
      date: key,
      label: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      }),
      leads: countsByDay.get(key) ?? 0,
    };
  });

  const total = currentTotalRow?.count ?? 0;
  const previousTotal = previousTotalRow?.count ?? 0;
  const changePercent = previousTotal > 0
    ? Number((((total - previousTotal) / previousTotal) * 100).toFixed(1))
    : null;

  return NextResponse.json({
    days,
    from: data[0]?.date ?? null,
    to: data[data.length - 1]?.date ?? null,
    total,
    previousTotal,
    changePercent,
    data,
  });
}
