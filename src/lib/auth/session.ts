import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

const AUTH_COOKIE_NAME = "auth_token";
const ONE_DAY_SECONDS = 24 * 60 * 60;
const THIRTY_DAYS_SECONDS = 30 * ONE_DAY_SECONDS;

export type SessionUser = {
  id: number;
  name: string;
  email: string;
  avatar: string | null;
  role: "admin" | "member" | "read_only";
  status: "active" | "pending" | "inactive";
};

type SessionPayload = {
  userId: number;
  exp: number;
};

function encodeBase64Url(value: string) {
  return Buffer.from(value).toString("base64url");
}

function decodeBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function getSessionSecret() {
  return process.env.SESSION_SECRET || process.env.DATABASE_URL || "crm-dev-session-secret";
}

function sign(value: string) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

function serializeSession(payload: SessionPayload) {
  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const signature = sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

function parseSession(token: string): SessionPayload | null {
  const [encodedPayload, providedSignature] = token.split(".");
  if (!encodedPayload || !providedSignature) {
    return null;
  }

  const expectedSignature = sign(encodedPayload);
  if (
    expectedSignature.length !== providedSignature.length ||
    !timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(providedSignature))
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(decodeBase64Url(encodedPayload)) as SessionPayload;
    if (!payload.userId || !payload.exp) {
      return null;
    }

    if (Date.now() >= payload.exp) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

function cookieLifetimeSeconds(rememberDevice: boolean) {
  return rememberDevice ? THIRTY_DAYS_SECONDS : ONE_DAY_SECONDS;
}

export async function createSession(userId: number, rememberDevice: boolean) {
  const maxAge = cookieLifetimeSeconds(rememberDevice);
  const payload: SessionPayload = {
    userId,
    exp: Date.now() + maxAge * 1000,
  };
  const token = serializeSession(payload);
  const cookieStore = await cookies();

  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const payload = parseSession(token);
  if (!payload) {
    return null;
  }

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      avatar: users.avatar,
      role: users.role,
      status: users.status,
    })
    .from(users)
    .where(and(eq(users.id, payload.userId), eq(users.status, "active")))
    .limit(1);

  return user ?? null;
}
