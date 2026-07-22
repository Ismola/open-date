import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { jsonError, readJson } from "@/lib/http";
import { getDb } from "@/lib/mongodb";
import { responseSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const parsed = responseSchema.safeParse(await readJson(request));
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Respuesta no válida");
  const db = await getDb();
  const event = await db.collection("events").findOne({ slug, status: "published" });
  if (!event) return jsonError("Invitación no encontrada", 404);

  const now = new Date();
  const response = { ...parsed.data, createdAt: now };
  await db.collection<Record<string, unknown>>("events").updateOne(
    { _id: event._id },
    { $push: { responses: response } as never, $set: { respondedAt: now, updatedAt: now } },
  );
  await db.collection("notifications").insertOne({
    ownerId: event.ownerId as ObjectId,
    eventId: event._id,
    type: "responded",
    recipientName: parsed.data.recipientName,
    message: `${parsed.data.recipientName} ha respondido a tu evento`,
    readAt: null,
    createdAt: now,
  });
  return NextResponse.json({ ok: true });
}
