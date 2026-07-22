import { NextResponse } from "next/server";
import { createSessionToken, setSessionCookie, verifyPassword } from "@/lib/auth";
import { isAdminEmail } from "@/lib/config";
import { jsonError, readJson } from "@/lib/http";
import { getDb } from "@/lib/mongodb";
import { loginSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await readJson(request));
  if (!parsed.success) return jsonError("Correo o contraseña no válidos");

  const db = await getDb();
  const user = await db.collection("users").findOne({ email: parsed.data.email });
  if (!user || !(await verifyPassword(parsed.data.password, String(user.passwordHash)))) {
    return jsonError("Correo o contraseña incorrectos", 401);
  }
  if (user.active === false) return jsonError("Esta cuenta está desactivada", 403);

  await setSessionCookie(
    await createSessionToken({
      sub: user._id.toString(),
      email: String(user.email),
      name: String(user.name),
    }),
  );

  return NextResponse.json({
    user: {
      id: user._id.toString(),
      name: String(user.name),
      email: String(user.email),
      active: true,
      isAdmin: isAdminEmail(String(user.email)),
    },
  });
}
