import { NextResponse } from "next/server";
import { jsonError } from "@/lib/http";
import { getDb } from "@/lib/mongodb";

export const runtime = "nodejs";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const db = await getDb();
  const event = await db.collection("events").findOne({ slug, status: "published" });
  if (!event) return jsonError("Esta invitación no existe o ya no está disponible", 404);
  return NextResponse.json({
    event: {
      id: event._id.toString(),
      title: event.title,
      slug: event.slug,
      recipientName: event.recipientName,
      intro: event.intro,
      scheduledFor: event.scheduledFor,
      coverImage: event.coverImage,
      accent: event.accent,
      blocks: event.blocks,
      status: event.status,
      respondedAt: event.respondedAt,
    },
  });
}
