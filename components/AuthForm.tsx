"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const body = await response.json();
    if (!response.ok) {
      setError(body.error ?? "Algo no ha salido bien");
      setLoading(false);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  const register = mode === "register";
  return (
    <form className="auth-card" onSubmit={submit}>
      <span className="auth-sticker">{register ? "✦" : "♥"}</span>
      <p className="eyebrow">{register ? "EMPIEZA LA HISTORIA" : "QUÉ BUENO VERTE"}</p>
      <h1>{register ? "Crea cosas difíciles de rechazar" : "Vuelve a tus planes"}</h1>
      <p>{register ? "Tu cuenta, tus eventos y tus reglas." : "Entra para ver si ya han respondido."}</p>
      {register && (
        <label>
          Tu nombre
          <input name="name" autoComplete="name" placeholder="Isma" required minLength={2} />
        </label>
      )}
      <label>
        Correo electrónico
        <input name="email" type="email" autoComplete="email" placeholder="tu@correo.com" required />
      </label>
      <label>
        Contraseña
        <input name="password" type="password" autoComplete={register ? "new-password" : "current-password"} placeholder="Mínimo 8 caracteres" required minLength={register ? 8 : 1} />
      </label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="button button-blue full-button" disabled={loading}>
        {loading ? "Un momento…" : register ? "Crear mi cuenta" : "Entrar"}
      </button>
      <p className="auth-switch">
        {register ? "¿Ya tienes una cuenta?" : "¿Aún no tienes cuenta?"}{" "}
        <a href={register ? "/login" : "/register"}>{register ? "Inicia sesión" : "Créala gratis"}</a>
      </p>
    </form>
  );
}
