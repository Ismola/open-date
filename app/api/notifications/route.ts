import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getCurrentUser } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return jsonError("No autorizado", 401);
  const db = await getDb();
  const notifications = await db
    .collection("notifications")
    .find({ ownerId: new ObjectId(user.id) })
    .sort({ createdAt: -1 })
    .limit(60)
    .toArray();
  return NextResponse.json({
    notifications: notifications.map((notification) => ({
      ...notification,
      id: notification._id.toString(),
      eventId: notification.eventId?.toString(),
      _id: undefined,
      ownerId: undefined,
    })),
  });
}

export async function PATCH() {
  const user = await getCurrentUser();
  if (!user) return jsonError("No autorizado", 401);
  const db = await getDb();
  await db.collection("notifications").updateMany(
    { ownerId: new ObjectId(user.id), readAt: null },
    { $set: { readAt: new Date() } },
  );
  return NextResponse.json({ ok: true });
}
