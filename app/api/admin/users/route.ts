import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { jsonError, readJson } from "@/lib/http";
import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs";

async function admin() {
  const user = await getCurrentUser();
  return user?.isAdmin ? user : null;
}

export async function GET(request: Request) {
  if (!(await admin())) return jsonError("Acceso reservado a administración", 403);
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  const db = await getDb();
  const filter = query
    ? { $or: [{ email: { $regex: query, $options: "i" } }, { name: { $regex: query, $options: "i" } }] }
    : {};
  const users = await db
    .collection("users")
    .find(filter)
    .project({ passwordHash: 0 })
    .sort({ createdAt: -1 })
    .limit(200)
    .toArray();
  return NextResponse.json({
    users: users.map((user) => ({ ...user, id: user._id.toString(), _id: undefined })),
  });
}

export async function PATCH(request: Request) {
  const current = await admin();
  if (!current) return jsonError("Acceso reservado a administración", 403);
  const body = await readJson(request);
  if (!body || !ObjectId.isValid(body.id) || typeof body.active !== "boolean") {
    return jsonError("Solicitud no válida");
  }
  if (body.id === current.id && body.active === false) {
    return jsonError("No puedes desactivar tu propia cuenta");
  }
  const db = await getDb();
  await db.collection("users").updateOne(
    { _id: new ObjectId(body.id) },
    { $set: { active: body.active, updatedAt: new Date() } },
  );
  return NextResponse.json({ ok: true });
}
