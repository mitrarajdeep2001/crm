import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { loginSchema } from "@/lib/validators";
import { createSession } from "@/lib/auth/session";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request" }, { status: 400 });
    }

    const email = parsed.data.email.trim().toLowerCase();
    const password = parsed.data.password;
    const rememberDevice = parsed.data.rememberDevice ?? false;

    const [user] = await db
      .select({
        id: users.id,
        password: users.password,
        status: users.status,
      })
      .from(users)
      .where(sql`lower(${users.email}) = ${email}`)
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    if (user.status !== "active") {
      return NextResponse.json({ error: "Your account is not active" }, { status: 403 });
    }

    const passwordCheck = verifyPassword(password, user.password);
    if (!passwordCheck.valid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    if (passwordCheck.needsRehash) {
      await db
        .update(users)
        .set({
          password: hashPassword(password),
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));
    }

    await createSession(user.id, rememberDevice);

    return NextResponse.json({ success: true, redirect: "/dashboard" });
  } catch (error) {
    console.error("Login failed", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
