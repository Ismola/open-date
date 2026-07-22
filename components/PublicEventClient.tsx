"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { EventAnswer, EventBlock, PublicEvent, TrickMode } from "@/lib/types";

export function PublicEventClient({ slug }: { slug: string }) {
  const [event, setEvent] = useState<PublicEvent | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    fetch(`/api/public/events/${slug}`)
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error ?? "Invitación no encontrada");
        return body.event as PublicEvent;
      })
      .then((loaded) => {
        setEvent(loaded);
        const openedKey = `open-date-opened-${slug}`;
        if (!sessionStorage.getItem(openedKey)) {
          sessionStorage.setItem(openedKey, "1");
          fetch(`/api/public/events/${slug}/open`, { method: "POST" }).catch(() => undefined);
        }
      })
      .catch((reason) => setError(reason.message))
      .finally(() => setLoading(false));
  }, [slug]);

  async function submit(submitEvent: FormEvent) {
    submitEvent.preventDefault();
    if (!event) return;
    const missing = event.blocks.find((block) => block.required && !answers[block.id]?.trim());
    if (missing) {
      setError(`Falta responder: ${missing.label}`);
      document.getElementById(`block-${missing.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setError("");
    setSending(true);
    const formatted: EventAnswer[] = event.blocks
      .filter((block) => answers[block.id] !== undefined)
      .map((block) => ({ blockId: block.id, label: block.label, value: answers[block.id] }));
    const response = await fetch(`/api/public/events/${slug}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipientName: event.recipientName, answers: formatted }),
    });
    const body = await response.json();
    setSending(false);
    if (!response.ok) {
      setError(body.error ?? "No se ha podido enviar la respuesta");
      return;
    }
    setSent(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (loading) return <PublicFrame><div className="invite-loading"><span>♥</span><h1>Preparando tu sorpresa…</h1></div></PublicFrame>;
  if (!event || error && !event) return <PublicFrame><div className="invite-error"><span>?</span><h1>Este enlace no está disponible</h1><p>{error}</p><Link href="/">Crear mi propio Open Date →</Link></div></PublicFrame>;
  if (sent) return <PublicFrame><div className="success-card"><span>★</span><p className="eyebrow">RESPUESTA ENVIADA</p><h1>¡Plan en marcha!</h1><p>Tu respuesta ya ha llegado. La otra persona acaba de recibir una notificación.</p><div className="confetti-row">♥ ✦ ★ ♥ ✦</div></div></PublicFrame>;

  return (
    <PublicFrame>
      <form className={`invitation accent-${event.accent}`} onSubmit={submit}>
        {event.coverImage && <div className="invitation-cover-frame"><img className="invitation-cover" src={event.coverImage} alt="Portada de la invitación" referrerPolicy="no-referrer" /></div>}
        <header className="invitation-hero">
          <span className="big-heart">♥</span>
          <p className="eyebrow">UNA INVITACIÓN PARA {event.recipientName.toUpperCase()}</p>
          <h1>{event.title}</h1>
          {event.intro && <p>{event.intro}</p>}
          {event.scheduledFor && <time>📅 {new Date(event.scheduledFor).toLocaleString("es-ES", { dateStyle: "full", timeStyle: "short" })}</time>}
        </header>

        <div className="invitation-blocks">
          {event.blocks.map((block, index) => (
            <PublicBlock
              block={block}
              index={index}
              key={block.id}
              value={answers[block.id] ?? ""}
              onChange={(value) => setAnswers((current) => ({ ...current, [block.id]: value }))}
            />
          ))}
        </div>

        {error && <p className="form-error public-error" role="alert">{error}</p>}
        <button className="button button-blue send-answer" disabled={sending}>{sending ? "Enviando…" : "Enviar mi respuesta ★"}</button>
        <p className="privacy-note mt-5">La respuesta solo la verá quien te envió este evento.</p>
      </form>
    </PublicFrame>
  );
}

function PublicFrame({ children }: { children: React.ReactNode }) {
  return <main className="public-page"><header className="public-header"><Link className="brand" href="/">OPEN <span>DATE</span><i>♥</i></Link><Link href="/register">Crea el tuyo ＋</Link></header>{children}<footer>Hecho con ♥ y un poquito de picardía en Open Date.</footer></main>;
}

function PublicBlock({ block, index, value, onChange }: { block: EventBlock; index: number; value: string; onChange: (value: string) => void }) {
  if (block.type === "message") return <section className="public-message" id={`block-${block.id}`}><span>{String(index + 1).padStart(2, "0")}</span><p>{block.label}</p></section>;
  if (block.type === "photo") return <section className="public-photo" id={`block-${block.id}`}><p>{block.label}</p>{block.imageUrl && <img src={block.imageUrl} alt={block.label} referrerPolicy="no-referrer" />}</section>;
  if (block.type === "gift") return <section className="public-gift" id={`block-${block.id}`}>{block.imageUrl ? <img src={block.imageUrl} alt="" referrerPolicy="no-referrer" /> : <span>🎁</span>}<div><p>{block.label}</p><h2>{block.giftTitle || "Un regalo para ti"}</h2>{block.linkUrl && <a href={block.linkUrl} target="_blank" rel="noreferrer">Abrir regalo →</a>}</div></section>;
  if (block.type === "date") return <section className="public-date" id={`block-${block.id}`}><span>📅</span><div><p>{block.label}</p><strong>{block.dateValue ? new Date(block.dateValue).toLocaleString("es-ES", { dateStyle: "full", timeStyle: "short" }) : "La fecha está por decidir"}</strong></div></section>;
  if (block.type === "text_input") return <section className="public-question" id={`block-${block.id}`}><span className="question-number">{index + 1}</span><label>{block.label}{block.required && <b>*</b>}<textarea value={value} onChange={(event) => onChange(event.target.value)} rows={4} placeholder="Escribe aquí…" required={block.required} /></label></section>;
  const options = block.type === "yes_no" ? ["Sí", "No"] : block.options ?? [];
  return <section className="public-question choice-question" id={`block-${block.id}`}><span className="question-number">{index + 1}</span><h2>{block.label}{block.required && <b>*</b>}</h2><TrickOptions options={options} desired={block.desiredAnswer ?? options[0]} trick={block.trickMode ?? "none"} value={value} onChange={onChange} /></section>;
}

function TrickOptions({ options, desired, trick, value, onChange }: { options: string[]; desired: string; trick: TrickMode; value: string; onChange: (value: string) => void }) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [hidden, setHidden] = useState(false);
  const [scale, setScale] = useState(1);
  const [swapped, setSwapped] = useState(false);
  const dodgeStep = useRef(0);
  const ordered = swapped ? [...options].reverse() : options;

  function tease(option: string) {
    if (option === desired || trick === "none") {
      onChange(option);
      return;
    }
    if (trick === "runaway") {
      const compact = window.matchMedia("(max-width: 700px)").matches;
      const positions = compact
        ? [{ x: 95, y: -70 }, { x: -100, y: 78 }, { x: 90, y: 85 }, { x: -92, y: -82 }]
        : [{ x: 175, y: -65 }, { x: -180, y: 75 }, { x: 165, y: 88 }, { x: -170, y: -82 }];
      setOffset(positions[dodgeStep.current % positions.length]);
      dodgeStep.current += 1;
    }
    if (trick === "vanish") setHidden(true);
    if (trick === "grow") setScale((current) => Math.min(1.8, current + .16));
    if (trick === "swap") setSwapped((current) => !current);
  }

  return <div className="trick-options">{ordered.map((option) => {
    const desiredOption = option === desired;
    const isHidden = hidden && !desiredOption;
    return <button
      type="button"
      key={option}
      className={`${desiredOption ? "desired-option" : "wrong-option"} ${value === option ? "selected" : ""}`}
      style={{
        visibility: isHidden ? "hidden" : "visible",
        transform: desiredOption ? `scale(${scale})` : trick === "runaway" ? `translate(${offset.x}px, ${offset.y}px) rotate(-3deg)` : undefined,
      }}
      onPointerEnter={() => !desiredOption && trick !== "none" && tease(option)}
      onFocus={() => !desiredOption && trick !== "none" && tease(option)}
      onClick={() => tease(option)}
      aria-pressed={value === option}
    >{option}{desiredOption && value === option ? " ★" : ""}</button>;
  })}</div>;
}
