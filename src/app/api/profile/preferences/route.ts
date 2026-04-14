import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { userPreferences } from "@/lib/db/schema";
import { getSessionUser } from "@/lib/auth/session";

const preferencesSchema = z.object({
  emailNotifications: z.boolean(),
  desktopNotifications: z.boolean(),
  weeklyDigest: z.boolean(),
});

async function ensurePreferences(userId: number) {
  const [existing] = await db
    .select({
      id: userPreferences.id,
      userId: userPreferences.userId,
      emailNotifications: userPreferences.emailNotifications,
      desktopNotifications: userPreferences.desktopNotifications,
      weeklyDigest: userPreferences.weeklyDigest,
    })
    .from(userPreferences)
    .where(eq(userPreferences.userId, userId))
    .limit(1);

  if (existing) {
    return existing;
  }

  const [created] = await db
    .insert(userPreferences)
    .values({
      userId,
      emailNotifications: true,
      desktopNotifications: false,
      weeklyDigest: true,
    })
    .returning({
      id: userPreferences.id,
      userId: userPreferences.userId,
      emailNotifications: userPreferences.emailNotifications,
      desktopNotifications: userPreferences.desktopNotifications,
      weeklyDigest: userPreferences.weeklyDigest,
    });

  return created;
}

export async function GET() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const preferences = await ensurePreferences(sessionUser.id);

  return NextResponse.json({
    preferences: {
      emailNotifications: preferences.emailNotifications,
      desktopNotifications: preferences.desktopNotifications,
      weeklyDigest: preferences.weeklyDigest,
    },
  });
}

export async function PATCH(request: NextRequest) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = preferencesSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request" }, { status: 400 });
  }

  const [updated] = await db
    .insert(userPreferences)
    .values({
      userId: sessionUser.id,
      ...parsed.data,
    })
    .onConflictDoUpdate({
      target: userPreferences.userId,
      set: {
        emailNotifications: parsed.data.emailNotifications,
        desktopNotifications: parsed.data.desktopNotifications,
        weeklyDigest: parsed.data.weeklyDigest,
        updatedAt: new Date(),
      },
    })
    .returning({
      emailNotifications: userPreferences.emailNotifications,
      desktopNotifications: userPreferences.desktopNotifications,
      weeklyDigest: userPreferences.weeklyDigest,
    });

  return NextResponse.json({ success: true, preferences: updated });
}
