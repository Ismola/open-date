"use client";

import { useEffect, useState } from "react";
import type { SessionUser } from "@/lib/types";
import { AppHeader } from "./AppHeader";

type AdminUser = { id: string; name: string; email: string; active: boolean; createdAt: string };
type AdminEvent = { id: string; title: string; slug: string; recipientName: string; status: string; createdAt: string; openCount: number; responses?: unknown[]; owner?: { name: string; email: string } };

export function AdminPanel({ user }: { user: SessionUser }) {
  const [tab, setTab] = useState<"users" | "events">("users");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const [userResponse, eventResponse] = await Promise.all([
      fetch(`/api/admin/users?q=${encodeURIComponent(query)}`),
      fetch(`/api/admin/events?q=${encodeURIComponent(query)}`),
    ]);
    if (userResponse.ok) setUsers((await userResponse.json()).users);
    if (eventResponse.ok) setEvents((await eventResponse.json()).events);
    setLoading(false);
  }

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetch("/api/admin/users"), fetch("/api/admin/events")])
      .then(async ([userResponse, eventResponse]) => {
        const userBody = userResponse.ok ? await userResponse.json() : { users: [] };
        const eventBody = eventResponse.ok ? await eventResponse.json() : { events: [] };
        if (!cancelled) {
          setUsers(userBody.users);
          setEvents(eventBody.events);
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  async function toggleUser(target: AdminUser) {
    const response = await fetch("/api/admin/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: target.id, active: !target.active }) });
    if (response.ok) setUsers((items) => items.map((item) => item.id === target.id ? { ...item, active: !item.active } : item));
  }

  async function setEventStatus(id: string, status: string) {
    const response = await fetch("/api/admin/events", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    if (response.ok) setEvents((items) => items.map((item) => item.id === id ? { ...item, status } : item));
  }

  async function deleteEvent(id: string) {
    if (!window.confirm("¿Eliminar definitivamente este evento?")) return;
    const response = await fetch(`/api/admin/events?id=${id}`, { method: "DELETE" });
    if (response.ok) setEvents((items) => items.filter((item) => item.id !== id));
  }

  return <main className="app-shell admin-shell"><AppHeader user={user} /><section className="admin-heading"><div><p className="eyebrow">SOLO @ISMOLA.DEV</p><h1>Administración</h1><p>Usuarios, eventos y las llaves del reino.</p></div><div className="admin-total"><b>{users.length}</b><span>usuarios</span><b>{events.length}</b><span>eventos</span></div></section>
    <section className="admin-card">
      <div className="admin-toolbar"><div className="admin-tabs"><button className={tab === "users" ? "active" : ""} onClick={() => setTab("users")}>Usuarios</button><button className={tab === "events" ? "active" : ""} onClick={() => setTab("events")}>Eventos</button></div><form onSubmit={(event) => { event.preventDefault(); load(); }}><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar…" /><button>Buscar</button></form></div>
      {loading ? <div className="page-loader small-loader">Cargando datos…</div> : tab === "users" ? <div className="admin-table"><div className="table-head"><span>Usuario</span><span>Alta</span><span>Estado</span><span>Acción</span></div>{users.map((target) => <div className="table-row" key={target.id}><span><b>{target.name}</b><small>{target.email}</small></span><span>{new Date(target.createdAt).toLocaleDateString("es-ES")}</span><span><i className={target.active ? "dot-on" : "dot-off"} />{target.active ? "Activo" : "Desactivado"}</span><span><button disabled={target.id === user.id} onClick={() => toggleUser(target)}>{target.active ? "Desactivar" : "Activar"}</button></span></div>)}</div>
      : <div className="admin-table"><div className="table-head event-table"><span>Evento</span><span>Creador</span><span>Actividad</span><span>Estado</span><span>Acción</span></div>{events.map((item) => <div className="table-row event-table" key={item.id}><span><b>{item.title}</b><small>/date/{item.slug} · para {item.recipientName}</small></span><span><b>{item.owner?.name ?? "—"}</b><small>{item.owner?.email}</small></span><span>{item.openCount ?? 0} aperturas<br />{item.responses?.length ?? 0} respuestas</span><span><select value={item.status} onChange={(event) => setEventStatus(item.id, event.target.value)}><option value="draft">Borrador</option><option value="published">Publicado</option><option value="disabled">Desactivado</option></select></span><span><button className="danger-link" onClick={() => deleteEvent(item.id)}>Eliminar</button></span></div>)}</div>}
    </section>
  </main>;
}
