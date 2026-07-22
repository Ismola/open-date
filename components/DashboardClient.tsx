"use client";

import { useEffect, useMemo, useState } from "react";
import type { SessionUser } from "@/lib/types";
import { AppHeader } from "./AppHeader";

type DashboardEvent = {
  id: string;
  title: string;
  slug: string;
  recipientName: string;
  status: string;
  openCount: number;
  responses?: EventResponse[];
  createdAt: string;
};

type EventResponse = {
  recipientName: string;
  answers: Array<{ blockId: string; label: string; value: string }>;
  createdAt: string;
};

type Notification = {
  id: string;
  eventId: string;
  message: string;
  type: "opened" | "responded";
  readAt: string | null;
  createdAt: string;
};

export function DashboardClient({ user }: { user: SessionUser }) {
  const [events, setEvents] = useState<DashboardEvent[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState("");
  const [responsesEvent, setResponsesEvent] = useState<DashboardEvent | null>(null);

  useEffect(() => {
    Promise.all([fetch("/api/events"), fetch("/api/notifications")])
      .then(async ([eventResponse, notificationResponse]) => {
        if (eventResponse.ok) setEvents((await eventResponse.json()).events);
        if (notificationResponse.ok) setNotifications((await notificationResponse.json()).notifications);
      })
      .finally(() => setLoading(false));
  }, []);

  const unread = notifications.filter((item) => !item.readAt).length;
  const stats = useMemo(
    () => ({
      published: events.filter((event) => event.status === "published").length,
      opens: events.reduce((sum, event) => sum + (event.openCount ?? 0), 0),
      answers: events.reduce((sum, event) => sum + (event.responses?.length ?? 0), 0),
    }),
    [events],
  );

  async function copyLink(slug: string) {
    const url = `${window.location.origin}/date/${slug}`;
    await navigator.clipboard.writeText(url);
    setCopied(slug);
    window.setTimeout(() => setCopied(""), 1800);
  }

  async function removeEvent(id: string) {
    if (!window.confirm("¿Eliminar este evento y sus notificaciones?")) return;
    const response = await fetch(`/api/events/${id}`, { method: "DELETE" });
    if (response.ok) setEvents((current) => current.filter((event) => event.id !== id));
  }

  async function markRead() {
    await fetch("/api/notifications", { method: "PATCH" });
    setNotifications((items) => items.map((item) => ({ ...item, readAt: item.readAt ?? new Date().toISOString() })));
  }

  return (
    <main className="app-shell">
      <AppHeader user={user} unread={unread} />
      <section className="dashboard-heading">
        <div>
          <p className="eyebrow">HOLA, {user.name.toUpperCase()}</p>
          <h1>¿A quién vas a sorprender hoy?</h1>
        </div>
        <a className="button button-blue" href="/events/new">＋ Crear evento</a>
      </section>

      <section className="stats-grid" aria-label="Resumen de actividad">
        <article className="stat yellow"><b>{stats.published}</b><span>Eventos activos</span></article>
        <article className="stat mint"><b>{stats.opens}</b><span>Veces abiertos</span></article>
        <article className="stat pink"><b>{stats.answers}</b><span>Respuestas</span></article>
      </section>

      <div className="dashboard-grid">
        <section>
          <div className="section-title"><h2>Mis eventos</h2><span>{events.length}</span></div>
          {loading ? (
            <div className="empty-card">Cargando tus mejores ideas…</div>
          ) : events.length === 0 ? (
            <div className="empty-card"><span>✦</span><h3>Aquí falta un plan</h3><p>Crea tu primer evento y comparte un enlace único.</p><a href="/events/new">Crear el primero →</a></div>
          ) : (
            <div className="event-list">
              {events.map((event) => (
                <article className="dashboard-event" key={event.id}>
                  <div className="event-badge">♥</div>
                  <div className="event-main">
                    <div className="event-meta"><span className={`status-pill ${event.status}`}>{event.status}</span><span>Para {event.recipientName}</span></div>
                    <h3>{event.title}</h3>
                    <p>/date/{event.slug}</p>
                  </div>
                  <div className="event-counts"><span><b>{event.openCount ?? 0}</b> aperturas</span><span><b>{event.responses?.length ?? 0}</b> respuestas</span></div>
                  <div className="event-actions">
                    <button onClick={() => copyLink(event.slug)}>{copied === event.slug ? "Copiado ✓" : "Copiar enlace"}</button>
                    <button onClick={() => setResponsesEvent(event)} disabled={!event.responses?.length}>Ver respuestas</button>
                    <a href={`/events/${event.id}/edit`}>Editar</a>
                    <button className="danger-link" onClick={() => removeEvent(event.id)}>Eliminar</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <aside className="notifications-panel" id="notifications">
          <div className="section-title"><h2>Notificaciones</h2>{unread > 0 && <button onClick={markRead}>Marcar leídas</button>}</div>
          {notifications.length === 0 ? (
            <p className="quiet">Cuando alguien abra o responda a un evento, aparecerá aquí.</p>
          ) : notifications.map((notification) => (
            <article className={`notification ${notification.readAt ? "" : "unread"}`} key={notification.id}>
              <span>{notification.type === "responded" ? "★" : "♥"}</span>
              <div><strong>{notification.message}</strong><time>{new Date(notification.createdAt).toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" })}</time></div>
            </article>
          ))}
        </aside>
      </div>
      {responsesEvent && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="responses-title" onMouseDown={(event) => { if (event.target === event.currentTarget) setResponsesEvent(null); }}>
          <section className="responses-modal">
            <button className="modal-close" onClick={() => setResponsesEvent(null)} aria-label="Cerrar">×</button>
            <p className="eyebrow">RESPUESTAS RECIBIDAS</p>
            <h2 id="responses-title">{responsesEvent.title}</h2>
            <div className="responses-list">
              {responsesEvent.responses?.map((response, index) => (
                <article className="response-card" key={`${response.createdAt}-${index}`}>
                  <header><strong>{response.recipientName}</strong><time>{new Date(response.createdAt).toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" })}</time></header>
                  {response.answers.length ? response.answers.map((answer) => <div className="response-answer" key={`${answer.blockId}-${answer.label}`}><span>{answer.label}</span><b>{answer.value}</b></div>) : <p className="quiet">No dejó respuestas.</p>}
                </article>
              ))}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
