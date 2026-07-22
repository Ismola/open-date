import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import { config, isAdminEmail } from "./config";
import { getDb } from "./mongodb";
import type { SessionUser } from "./types";

type SessionPayload = { sub: string; email: string; name: string };

function secret() {
  return new TextEncoder().encode(config.authSecret);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT({ email: payload.email, name: payload.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("14d")
    .sign(secret());
}

export async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(config.sessionCookie, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 14,
    path: "/",
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.set(config.sessionCookie, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(config.sessionCookie)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub || typeof payload.email !== "string") return null;
    const db = await getDb();
    const user = await db.collection("users").findOne({
      _id: new ObjectId(payload.sub),
    });
    if (!user || user.active === false) return null;
    return {
      id: user._id.toString(),
      name: String(user.name ?? payload.name ?? "Usuario"),
      email: String(user.email),
      active: user.active !== false,
      isAdmin: isAdminEmail(String(user.email)),
    };
  } catch {
    return null;
  }
}
