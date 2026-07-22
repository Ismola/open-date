import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getCurrentUser } from "@/lib/auth";
import { jsonError, readJson } from "@/lib/http";
import { getDb } from "@/lib/mongodb";
import { eventSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return jsonError("No autorizado", 401);
  const db = await getDb();
  const events = await db
    .collection("events")
    .find({ ownerId: new ObjectId(user.id) })
    .sort({ createdAt: -1 })
    .project({ title: 1, slug: 1, recipientName: 1, status: 1, openCount: 1, responses: 1, createdAt: 1 })
    .toArray();
  return NextResponse.json({
    events: events.map((event) => ({ ...event, id: event._id.toString(), _id: undefined })),
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return jsonError("No autorizado", 401);
  const parsed = eventSchema.safeParse(await readJson(request));
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Evento no válido");

  const db = await getDb();
  const existing = await db.collection("events").findOne({ slug: parsed.data.slug });
  if (existing) return jsonError("Ese enlace ya está ocupado", 409);

  const now = new Date();
  const result = await db.collection("events").insertOne({
    ...parsed.data,
    ownerId: new ObjectId(user.id),
    openCount: 0,
    responses: [],
    createdAt: now,
    updatedAt: now,
  });
  return NextResponse.json(
    { event: { ...parsed.data, id: result.insertedId.toString() } },
    { status: 201 },
  );
}
