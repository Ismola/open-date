"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import type { SessionUser } from "@/lib/types";

export function AppHeader({ user, unread = 0 }: { user?: SessionUser | null; unread?: number }) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <header className="appbar">
      <Link className="brand" href="/" aria-label="Open Date, inicio">
        OPEN <span>DATE</span><i>♥</i>
      </Link>
      <nav className="appnav" aria-label="Navegación de la cuenta">
        {user ? (
          <>
            <a href="/dashboard">Mis eventos</a>
            <a href="/dashboard#notifications">Notificaciones {unread > 0 && <b>{unread}</b>}</a>
            {user.isAdmin && <a className="admin-link" href="/admin">Administración</a>}
          </>
        ) : (
          <>
            <a href="/login">Entrar</a>
            <a className="nav-cta" href="/register">Crear cuenta</a>
          </>
        )}
      </nav>
      {user && (
        <div className="account-menu">
          <span className="avatar">{user.name.slice(0, 2).toUpperCase()}</span>
          <button onClick={logout}>Salir</button>
        </div>
      )}
    </header>
  );
}
