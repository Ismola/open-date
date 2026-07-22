import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { jsonError, readJson } from "@/lib/http";
import { getDb } from "@/lib/mongodb";
import { eventSchema } from "@/lib/validation";

export const runtime = "nodejs";

function idFrom(value: string) {
  return ObjectId.isValid(value) ? new ObjectId(value) : null;
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return jsonError("No autorizado", 401);
  const { id } = await context.params;
  const objectId = idFrom(id);
  if (!objectId) return jsonError("Evento no válido", 404);
  const db = await getDb();
  const event = await db.collection("events").findOne({
    _id: objectId,
    ownerId: new ObjectId(user.id),
  });
  if (!event) return jsonError("Evento no encontrado", 404);
  return NextResponse.json({ event: { ...event, id: event._id.toString(), _id: undefined } });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return jsonError("No autorizado", 401);
  const { id } = await context.params;
  const objectId = idFrom(id);
  if (!objectId) return jsonError("Evento no válido", 404);
  const parsed = eventSchema.safeParse(await readJson(request));
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Evento no válido");
  const db = await getDb();
  const slugOwner = await db.collection("events").findOne({
    slug: parsed.data.slug,
    _id: { $ne: objectId },
  });
  if (slugOwner) return jsonError("Ese enlace ya está ocupado", 409);
  const result = await db.collection("events").updateOne(
    { _id: objectId, ownerId: new ObjectId(user.id) },
    { $set: { ...parsed.data, updatedAt: new Date() } },
  );
  if (!result.matchedCount) return jsonError("Evento no encontrado", 404);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return jsonError("No autorizado", 401);
  const { id } = await context.params;
  const objectId = idFrom(id);
  if (!objectId) return jsonError("Evento no válido", 404);
  const db = await getDb();
  const result = await db.collection("events").deleteOne({
    _id: objectId,
    ownerId: new ObjectId(user.id),
  });
  if (!result.deletedCount) return jsonError("Evento no encontrado", 404);
  await db.collection("notifications").deleteMany({ eventId: objectId });
  return NextResponse.json({ ok: true });
}
