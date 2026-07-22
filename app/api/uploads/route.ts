import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { config } from "@/lib/config";
import { jsonError } from "@/lib/http";
import { uploadPublicImage } from "@/lib/storage";

export const runtime = "nodejs";

const allowed = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"],
]);

export async function POST(request: Request) {
  if (!(await getCurrentUser())) return jsonError("No autorizado", 401);
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return jsonError("Selecciona una imagen");
  const extension = allowed.get(file.type);
  if (!extension) return jsonError("Formato no permitido. Usa JPG, PNG, WebP o GIF");
  if (file.size > config.maxUploadMb * 1024 * 1024) {
    return jsonError(`La imagen supera el máximo de ${config.maxUploadMb} MB`);
  }
  const key = `images/${randomUUID()}${extension}`;
  const url = await uploadPublicImage(key, new Uint8Array(await file.arrayBuffer()), file.type);
  return NextResponse.json({ url }, { status: 201 });
}
