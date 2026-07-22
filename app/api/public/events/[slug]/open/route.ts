import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { jsonError } from "@/lib/http";
import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs";

export async function POST(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const db = await getDb();
  const event = await db.collection("events").findOne({ slug, status: "published" });
  if (!event) return jsonError("Invitación no encontrada", 404);

  const now = new Date();
  await db.collection("events").updateOne(
    { _id: event._id },
    { $inc: { openCount: 1 }, $set: { lastOpenedAt: now } },
  );
  await db.collection("notifications").insertOne({
    ownerId: event.ownerId as ObjectId,
    eventId: event._id,
    type: "opened",
    recipientName: event.recipientName,
    message: `${event.recipientName} ha abierto tu evento`,
    readAt: null,
    createdAt: now,
  });
  return NextResponse.json({ ok: true });
}
