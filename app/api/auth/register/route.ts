import { MongoServerError } from "mongodb";
import { NextResponse } from "next/server";
import { createSessionToken, hashPassword, setSessionCookie } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { jsonError, readJson } from "@/lib/http";
import { registerSchema } from "@/lib/validation";
import { isAdminEmail } from "@/lib/config";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const parsed = registerSchema.safeParse(await readJson(request));
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Datos no válidos");

  try {
    const db = await getDb();
    const now = new Date();
    const result = await db.collection("users").insertOne({
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash: await hashPassword(parsed.data.password),
      active: true,
      createdAt: now,
      updatedAt: now,
    });
    const token = await createSessionToken({
      sub: result.insertedId.toString(),
      email: parsed.data.email,
      name: parsed.data.name,
    });
    await setSessionCookie(token);
    return NextResponse.json(
      {
        user: {
          id: result.insertedId.toString(),
          name: parsed.data.name,
          email: parsed.data.email,
          active: true,
          isAdmin: isAdminEmail(parsed.data.email),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) {
      return jsonError("Ya existe una cuenta con ese correo", 409);
    }
    return jsonError("No se ha podido crear la cuenta", 500);
  }
}
