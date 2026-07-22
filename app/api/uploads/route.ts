import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { config } from "@/lib/config";
import { jsonError } from "@/lib/http";

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
  const filename = `${randomUUID()}${extension}`;
  await mkdir(config.uploadDir, { recursive: true });
  await writeFile(path.join(config.uploadDir, filename), Buffer.from(await file.arrayBuffer()));
  return NextResponse.json({ url: `/api/uploads/${filename}` }, { status: 201 });
}
