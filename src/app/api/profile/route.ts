import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getSessionUser } from "@/lib/auth/session";

const updateProfileSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.string().trim().email("A valid email is required"),
});

function splitName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return { firstName: "", lastName: "" };
  }
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "" };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

export async function GET() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const name = splitName(sessionUser.name);
  return NextResponse.json({
    profile: {
      id: sessionUser.id,
      name: sessionUser.name,
      firstName: name.firstName,
      lastName: name.lastName,
      email: sessionUser.email,
      avatar: sessionUser.avatar,
      role: sessionUser.role,
      status: sessionUser.status,
    },
  });
}

export async function PATCH(request: NextRequest) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request" }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const [duplicate] = await db
    .select({ id: users.id })
    .from(users)
    .where(and(sql`lower(${users.email}) = ${email}`, sql`${users.id} <> ${sessionUser.id}`))
    .limit(1);

  if (duplicate) {
    return NextResponse.json({ error: "Email is already in use" }, { status: 409 });
  }

  const fullName = `${parsed.data.firstName} ${parsed.data.lastName}`.trim();

  const [updatedUser] = await db
    .update(users)
    .set({
      name: fullName,
      email,
      updatedAt: new Date(),
    })
    .where(eq(users.id, sessionUser.id))
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      avatar: users.avatar,
      role: users.role,
      status: users.status,
    });

  if (!updatedUser) {
    return NextResponse.json({ error: "Profile update failed" }, { status: 500 });
  }

  const name = splitName(updatedUser.name);
  return NextResponse.json({
    success: true,
    profile: {
      id: updatedUser.id,
      name: updatedUser.name,
      firstName: name.firstName,
      lastName: name.lastName,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      role: updatedUser.role,
      status: updatedUser.status,
    },
  });
}
