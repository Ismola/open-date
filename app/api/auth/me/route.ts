import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { jsonError } from "@/lib/http";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return jsonError("No has iniciado sesión", 401);
  return NextResponse.json({ user });
}
