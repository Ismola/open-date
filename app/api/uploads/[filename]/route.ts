import { readFile } from "fs/promises";
import path from "path";
import { config } from "@/lib/config";
import { jsonError } from "@/lib/http";

export const runtime = "nodejs";

const mime: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

export async function GET(_request: Request, context: { params: Promise<{ filename: string }> }) {
  const { filename } = await context.params;
  const clean = path.basename(filename);
  if (clean !== filename || !mime[path.extname(clean).toLowerCase()]) {
    return jsonError("Imagen no encontrada", 404);
  }
  try {
    const body = await readFile(path.join(config.uploadDir, clean));
    return new Response(body, {
      headers: {
        "Content-Type": mime[path.extname(clean).toLowerCase()],
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return jsonError("Imagen no encontrada", 404);
  }
}
