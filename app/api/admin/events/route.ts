import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { jsonError, readJson } from "@/lib/http";
import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs";

async function isAdmin() {
  return (await getCurrentUser())?.isAdmin === true;
}

export async function GET(request: Request) {
  if (!(await isAdmin())) return jsonError("Acceso reservado a administración", 403);
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  const db = await getDb();
  const filter = query
    ? { $or: [{ title: { $regex: query, $options: "i" } }, { slug: { $regex: query, $options: "i" } }] }
    : {};
  const events = await db.collection("events").aggregate([
    { $match: filter },
    { $sort: { createdAt: -1 } },
    { $limit: 250 },
    { $lookup: { from: "users", localField: "ownerId", foreignField: "_id", as: "owner" } },
    { $project: { title: 1, slug: 1, recipientName: 1, status: 1, createdAt: 1, openCount: 1, responses: 1, owner: { $arrayElemAt: ["$owner", 0] } } },
  ]).toArray();
  return NextResponse.json({
    events: events.map((event) => ({
      ...event,
      id: event._id.toString(),
      _id: undefined,
      owner: event.owner ? { name: event.owner.name, email: event.owner.email } : null,
    })),
  });
}

export async function PATCH(request: Request) {
  if (!(await isAdmin())) return jsonError("Acceso reservado a administración", 403);
  const body = await readJson(request);
  if (!body || !ObjectId.isValid(body.id) || !["draft", "published", "disabled"].includes(body.status)) {
    return jsonError("Solicitud no válida");
  }
  const db = await getDb();
  await db.collection("events").updateOne(
    { _id: new ObjectId(body.id) },
    { $set: { status: body.status, updatedAt: new Date() } },
  );
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  if (!(await isAdmin())) return jsonError("Acceso reservado a administración", 403);
  const id = new URL(request.url).searchParams.get("id") ?? "";
  if (!ObjectId.isValid(id)) return jsonError("Evento no válido");
  const db = await getDb();
  const eventId = new ObjectId(id);
  await Promise.all([
    db.collection("events").deleteOne({ _id: eventId }),
    db.collection("notifications").deleteMany({ eventId }),
  ]);
  return NextResponse.json({ ok: true });
}
