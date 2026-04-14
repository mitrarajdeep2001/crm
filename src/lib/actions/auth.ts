"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { loginSchema } from "@/lib/validators";
import { createSession, clearSession } from "@/lib/auth/session";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

export async function loginAction(formData: FormData) {
  const rawData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    rememberDevice: formData.get("rememberDevice") === "on",
  };

  const result = loginSchema.safeParse(rawData);
  
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? "Invalid request" };
  }

  const [user] = await db
    .select({
      id: users.id,
      password: users.password,
      status: users.status,
    })
    .from(users)
    .where(sql`lower(${users.email}) = ${result.data.email.trim().toLowerCase()}`)
    .limit(1);

  if (!user || user.status !== "active") {
    return { error: "Invalid email or password" };
  }

  const passwordCheck = verifyPassword(result.data.password, user.password);
  if (!passwordCheck.valid) {
    return { error: "Invalid email or password" };
  }

  if (passwordCheck.needsRehash) {
    await db
      .update(users)
      .set({
        password: hashPassword(result.data.password),
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));
  }

  await createSession(user.id, result.data.rememberDevice ?? false);
  redirect("/dashboard");
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}
