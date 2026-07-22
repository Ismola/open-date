"use client";

import { useState } from "react";
import { GitHubLink } from "@/components/GitHubLink";

export default function Home() {
  const [noticeVisible, setNoticeVisible] = useState(true);
  const [noOffset, setNoOffset] = useState({ x: 0, y: 0 });
  const [yesScale, setYesScale] = useState(1);

  function dodgeNo() {
    setNoOffset({
      x: Math.round(Math.random() * 90 - 45),
      y: Math.round(Math.random() * 48 - 24),
    });
    setYesScale((current) => Math.min(current + 0.08, 1.4));
  }

  async function enter(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    const response = await fetch("/api/auth/me");
    window.location.href = response.ok ? "/dashboard" : "/login";
  }

  return (
    <main className="landing-shell">
      <nav className="topbar" aria-label="Navegación principal">
        <a className="brand" href="#top" aria-label="Open Date, inicio">
          OPEN <span>DATE</span><i>♥</i>
        </a>
        <div className="nav-links">
          {/* <a className="nav-active" href="#eventos">Mis eventos</a>
          <a href="#notificaciones">Notificaciones <b>2</b></a> */}
        </div>
        <div className="landing-actions">
          <GitHubLink />
          <a className="landing-login" href="/login" onClick={enter}>Entrar →</a>
        </div>
      </nav>

      <section className="hero" id="top">
        <div className="hero-copy">
          <span className="kicker">Preguntas serias. Respuestas inevitables.</span>
          <h1>Convierte cualquier pregunta en un momento <em>inolvidable</em></h1>
          <p>
            Crea una invitación única, añade fotos, fechas y regalos, y decide
            cuánto quieres tentar a la otra persona para que elija la respuesta correcta.
          </p>
          <div className="hero-actions">
            <a className="button button-blue" href="/events/new"><span>＋</span> Crear un evento</a>
            <a className="text-link" href="#como-funciona">Ver cómo funciona →</a>
          </div>
          <div className="trust-row" aria-label="Características principales">
            <span>✦ Enlace personalizable</span>
            <span>✦ Sin límites aburridos</span>
          </div>
        </div>

        <div className="demo-wrap" id="eventos">
          <span className="sticker sticker-heart" aria-hidden="true">♥</span>
          <span className="sticker sticker-mail" aria-hidden="true">✉</span>
          <article className="event-card">
            <header className="event-heading">
              <span className="event-icon">♥</span>
              <div>
                <p className="eyebrow">UNA INVITACIÓN PARA LUCÍA</p>
                <h2>¿Cena conmigo este viernes?</h2>
              </div>
            </header>
            <div className="status"><i /> Abierto · esperando respuesta</div>
            <div className="timeline" aria-label="Estado del evento">
              <span className="done">1<small>Creado</small></span>
              <span className="done">2<small>Abierto</small></span>
              <span>3<small>Respondido</small></span>
            </div>
            <p className="tiny-label">PRUEBA A PULSAR “NO”</p>
            <div className="answer-row">
              <button
                className="answer yes"
                style={{ transform: `scale(${yesScale})` }}
                onClick={() => setNoticeVisible(true)}
              >
                Sí <span>★</span>
              </button>
              <button
                className="answer no"
                style={{ transform: `translate(${noOffset.x}px, ${noOffset.y}px) rotate(-4deg)` }}
                onPointerEnter={dodgeNo}
                onFocus={dodgeNo}
                onClick={dodgeNo}
              >
                No
              </button>
            </div>
          </article>

          {noticeVisible && (
            <aside className="toast" id="notificaciones" role="status">
              <span className="toast-icon">♥</span>
              <div><small>NUEVA NOTIFICACIÓN</small><strong>Lucía ha abierto tu evento</strong></div>
              <button onClick={() => setNoticeVisible(false)} aria-label="Cerrar notificación">×</button>
            </aside>
          )}
        </div>
      </section>

      <section className="how" id="como-funciona">
        <p className="section-kicker">HECHO PARA SACAR UNA SONRISA</p>
        <h2>Tu pregunta. Tus reglas.</h2>
        <div className="feature-grid">
          <article><b>01</b><h3>Crea</h3><p>Personaliza el mensaje, el enlace, la fecha, las fotos y hasta los regalos.</p></article>
          <article><b>02</b><h3>Comparte</h3><p>Envía una URL hecha especialmente para esa persona.</p></article>
          <article><b>03</b><h3>Celébralo</h3><p>Recibe una notificación cuando abra la invitación y cuando responda.</p></article>
        </div>
      </section>
    </main>
  );
}
