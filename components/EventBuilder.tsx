"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { BlockType, EventBlock, SessionUser } from "@/lib/types";
import { AppHeader } from "./AppHeader";

const blockNames: Record<BlockType, string> = {
  message: "Texto",
  text_input: "Pregunta abierta",
  yes_no: "Sí / No",
  choices: "Opciones",
  date: "Fecha",
  photo: "Foto",
  gift: "Regalo",
};

function uid() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;
}

function makeBlock(type: BlockType): EventBlock {
  const base = { id: uid(), type, label: blockNames[type], required: false };
  if (type === "message") return { ...base, label: "Tengo una pregunta importante para ti…" };
  if (type === "text_input") return { ...base, label: "Cuéntame algo", required: true };
  if (type === "yes_no") return { ...base, label: "¿Te apuntas?", required: true, desiredAnswer: "Sí", trickMode: "runaway" };
  if (type === "choices") return { ...base, label: "Elige una opción", required: true, options: ["Plan A", "Plan B"], desiredAnswer: "Plan A", trickMode: "grow" };
  if (type === "date") return { ...base, label: "Guarda esta fecha", dateValue: "" };
  if (type === "photo") return { ...base, label: "Un pequeño spoiler", imageUrl: "" };
  return { ...base, label: "Tengo un detalle para ti", giftTitle: "Tu regalo", linkUrl: "", imageUrl: "" };
}

const initialBlocks = [makeBlock("message"), makeBlock("yes_no")];

export function EventBuilder({ user, eventId }: { user: SessionUser; eventId?: string }) {
  const [title, setTitle] = useState("¿Cena conmigo este viernes?");
  const [slug, setSlug] = useState("cena-conmigo");
  const [slugTouched, setSlugTouched] = useState(false);
  const [recipientName, setRecipientName] = useState("Lucía");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [intro, setIntro] = useState("He preparado algo especial. Solo necesitas elegir sabiamente.");
  const [scheduledFor, setScheduledFor] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [accent, setAccent] = useState<"blue" | "pink" | "yellow" | "mint">("pink");
  const [status, setStatus] = useState<"draft" | "published">("published");
  const [blocks, setBlocks] = useState<EventBlock[]>(initialBlocks);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedUrl, setSavedUrl] = useState("");
  const [loading, setLoading] = useState(Boolean(eventId));

  useEffect(() => {
    if (!eventId) return;
    fetch(`/api/events/${eventId}`)
      .then(async (response) => {
        if (!response.ok) throw new Error("No se ha podido abrir el evento");
        return response.json();
      })
      .then(({ event }) => {
        setTitle(event.title);
        setSlug(event.slug);
        setRecipientName(event.recipientName);
        setRecipientEmail(event.recipientEmail ?? "");
        setIntro(event.intro ?? "");
        setScheduledFor(event.scheduledFor ?? "");
        setCoverImage(event.coverImage ?? "");
        setAccent(event.accent ?? "pink");
        setStatus(event.status === "draft" ? "draft" : "published");
        setBlocks(event.blocks);
        setSlugTouched(true);
      })
      .catch((reason) => setError(reason.message))
      .finally(() => setLoading(false));
  }, [eventId]);

  const publicUrl = useMemo(() => {
    const origin = typeof window === "undefined" ? "" : window.location.origin;
    return `${origin}/date/${slug || "tu-enlace"}`;
  }, [slug]);

  function normalizeSlug(value: string) {
    return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70);
  }

  function onTitle(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(normalizeSlug(value));
  }

  function updateBlock(id: string, patch: Partial<EventBlock>) {
    setBlocks((current) => current.map((block) => (block.id === id ? { ...block, ...patch } : block)));
  }

  function moveBlock(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= blocks.length) return;
    setBlocks((current) => {
      const copy = [...current];
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
    });
  }

  async function upload(file: File, onDone: (url: string) => void) {
    const form = new FormData();
    form.append("file", file);
    const response = await fetch("/api/uploads", { method: "POST", body: form });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error ?? "No se ha podido subir la imagen");
    onDone(body.url);
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSaving(true);
    const payload = { title, slug, recipientName, recipientEmail, intro, scheduledFor, coverImage, accent, status, blocks };
    const response = await fetch(eventId ? `/api/events/${eventId}` : "/api/events", {
      method: eventId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await response.json();
    setSaving(false);
    if (!response.ok) {
      setError(body.error ?? "No se ha podido guardar el evento");
      return;
    }
    setSavedUrl(`${window.location.origin}/date/${slug}`);
  }

  if (loading) return <main className="app-shell"><AppHeader user={user} /><div className="page-loader">Montando tu evento…</div></main>;

  return (
    <main className="app-shell builder-shell">
      <AppHeader user={user} />
      <form className="builder" onSubmit={save}>
        <header className="builder-top">
          <div><a href="/dashboard" className="back-link">← Volver</a><h1>{eventId ? "Edita el plan" : "Crea algo inolvidable"}</h1><p>Todo se puede cambiar. Incluso cuánto corre el botón equivocado.</p></div>
          <div className="builder-actions"><select value={status} onChange={(event) => setStatus(event.target.value as "draft" | "published")} aria-label="Estado del evento"><option value="draft">Borrador</option><option value="published">Publicado</option></select><button className="button button-blue" disabled={saving}>{saving ? "Guardando…" : "Guardar evento"}</button></div>
        </header>

        {error && <p className="form-error wide-error" role="alert">{error}</p>}

        <div className="builder-grid">
          <div className="editor-column">
            <section className="editor-card">
              <div className="editor-card-title"><b>1</b><div><h2>Lo esencial</h2><p>Para quién es y cómo se va a llamar.</p></div></div>
              <div className="field-grid">
                <label className="field-wide">Título<input value={title} onChange={(event) => onTitle(event.target.value)} required /></label>
                <label>Para<input value={recipientName} onChange={(event) => setRecipientName(event.target.value)} required /></label>
                <label>Correo del destinatario <small>(opcional)</small><input type="email" value={recipientEmail} onChange={(event) => setRecipientEmail(event.target.value)} /></label>
                <label className="field-wide">Introducción<textarea value={intro} onChange={(event) => setIntro(event.target.value)} rows={3} /></label>
                <label>Fecha del plan<input type="datetime-local" value={scheduledFor} onChange={(event) => setScheduledFor(event.target.value)} /></label>
                <label>Color protagonista<select value={accent} onChange={(event) => setAccent(event.target.value as typeof accent)}><option value="pink">Rosa pop</option><option value="blue">Azul eléctrico</option><option value="yellow">Amarillo</option><option value="mint">Menta</option></select></label>
                <label className="field-wide">Foto de portada <span className="file-control"><input type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) upload(file, setCoverImage).catch((reason) => setError(reason.message)); }} />{coverImage ? "Cambiar imagen" : "Subir imagen"}</span></label>
              </div>
            </section>

            <section className="editor-card">
              <div className="editor-card-title"><b>2</b><div><h2>Tu enlace</h2><p>Que sea corto, reconocible y solo vuestro.</p></div></div>
              <label>Enlace personalizable<div className="slug-control"><span>/date/</span><input value={slug} onChange={(event) => { setSlugTouched(true); setSlug(normalizeSlug(event.target.value)); }} required minLength={3} /></div></label>
              <p className="url-preview">{publicUrl}</p>
            </section>

            <section className="editor-card">
              <div className="editor-card-title"><b>3</b><div><h2>Contenido e interacciones</h2><p>Añade, ordena y configura cada momento.</p></div></div>
              <div className="block-list">
                {blocks.map((block, index) => (
                  <article className="block-editor" key={block.id}>
                    <header><span>{index + 1}</span><strong>{blockNames[block.type]}</strong><div><button type="button" onClick={() => moveBlock(index, -1)} aria-label="Subir bloque">↑</button><button type="button" onClick={() => moveBlock(index, 1)} aria-label="Bajar bloque">↓</button><button type="button" className="delete-mini" onClick={() => setBlocks((current) => current.filter((item) => item.id !== block.id))} aria-label="Eliminar bloque">×</button></div></header>
                    <label>Texto<input value={block.label} onChange={(event) => updateBlock(block.id, { label: event.target.value })} /></label>
                    {["text_input", "yes_no", "choices"].includes(block.type) && <label className="check-label"><input type="checkbox" checked={block.required ?? false} onChange={(event) => updateBlock(block.id, { required: event.target.checked })} /> Respuesta obligatoria</label>}
                    {block.type === "choices" && <label>Opciones <small>(separadas por coma)</small><input value={(block.options ?? []).join(", ")} onChange={(event) => { const options = event.target.value.split(",").map((value) => value.trim()).filter(Boolean); updateBlock(block.id, { options, desiredAnswer: options.includes(block.desiredAnswer ?? "") ? block.desiredAnswer : options[0] }); }} /></label>}
                    {["yes_no", "choices"].includes(block.type) && <div className="field-grid compact"><label>Respuesta deseada<select value={block.desiredAnswer} onChange={(event) => updateBlock(block.id, { desiredAnswer: event.target.value })}>{(block.type === "yes_no" ? ["Sí", "No"] : block.options ?? []).map((option) => <option key={option}>{option}</option>)}</select></label><label>Travesura<select value={block.trickMode ?? "none"} onChange={(event) => updateBlock(block.id, { trickMode: event.target.value as EventBlock["trickMode"] })}><option value="none">Ninguna</option><option value="runaway">La incorrecta huye</option><option value="vanish">La incorrecta desaparece</option><option value="grow">La correcta crece</option><option value="swap">Se intercambian</option></select></label></div>}
                    {block.type === "date" && <label>Fecha<input type="datetime-local" value={block.dateValue ?? ""} onChange={(event) => updateBlock(block.id, { dateValue: event.target.value })} /></label>}
                    {["photo", "gift"].includes(block.type) && <label>Imagen<div className="inline-upload"><input value={block.imageUrl ?? ""} onChange={(event) => updateBlock(block.id, { imageUrl: event.target.value })} placeholder="URL o sube un archivo" /><span className="file-control small"><input type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) upload(file, (url) => updateBlock(block.id, { imageUrl: url })).catch((reason) => setError(reason.message)); }} />Subir</span></div></label>}
                    {block.type === "gift" && <><label>Nombre del regalo<input value={block.giftTitle ?? ""} onChange={(event) => updateBlock(block.id, { giftTitle: event.target.value })} /></label><label>Enlace del regalo<input type="url" value={block.linkUrl ?? ""} onChange={(event) => updateBlock(block.id, { linkUrl: event.target.value })} placeholder="https://…" /></label></>}
                  </article>
                ))}
              </div>
              <div className="add-blocks"><span>Añadir:</span>{(Object.keys(blockNames) as BlockType[]).map((type) => <button type="button" key={type} onClick={() => setBlocks((current) => [...current, makeBlock(type)])}>＋ {blockNames[type]}</button>)}</div>
            </section>
          </div>

          <aside className="live-preview">
            <div className="preview-label"><span>●</span> VISTA PREVIA</div>
            <div className={`phone-preview accent-${accent}`}>
              {coverImage && <img className="preview-cover" src={coverImage} alt="" />}
              <span className="preview-heart">♥</span>
              <p>PARA {recipientName.toUpperCase() || "ALGUIEN ESPECIAL"}</p>
              <h2>{title || "Tu pregunta aquí"}</h2>
              <div className="preview-intro">{intro}</div>
              {blocks.slice(0, 5).map((block) => <PreviewBlock block={block} key={block.id} />)}
              {blocks.length > 5 && <small>+ {blocks.length - 5} bloques más</small>}
            </div>
          </aside>
        </div>
      </form>

      {savedUrl && <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="saved-title"><div className="share-modal"><span className="celebrate">★</span><p className="eyebrow">EVENTO GUARDADO</p><h2 id="saved-title">Ya puedes compartirlo</h2><p>Este enlace es el único que necesita {recipientName}.</p><div className="share-link"><input readOnly value={savedUrl} /><button onClick={() => navigator.clipboard.writeText(savedUrl)}>Copiar</button></div><div className="modal-actions"><a className="button button-blue" href={savedUrl}>Abrir invitación</a><a href="/dashboard">Ir a mis eventos →</a></div><button className="modal-close" onClick={() => setSavedUrl("")} aria-label="Cerrar">×</button></div></div>}
    </main>
  );
}

function PreviewBlock({ block }: { block: EventBlock }) {
  if (block.type === "message") return <p className="preview-message">{block.label}</p>;
  if (block.type === "photo" && block.imageUrl) return <img className="preview-photo" src={block.imageUrl} alt="" />;
  if (block.type === "gift") return <div className="preview-gift">🎁 <b>{block.giftTitle || block.label}</b></div>;
  if (block.type === "date") return <div className="preview-date">📅 {block.dateValue ? new Date(block.dateValue).toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" }) : block.label}</div>;
  if (block.type === "text_input") return <div className="preview-field"><b>{block.label}</b><span>Escribe aquí…</span></div>;
  const options = block.type === "yes_no" ? ["Sí", "No"] : block.options ?? [];
  return <div className="preview-question"><b>{block.label}</b><div>{options.map((option) => <span className={option === block.desiredAnswer ? "desired" : ""} key={option}>{option}</span>)}</div><small>{block.trickMode !== "none" ? `Travesura: ${block.trickMode}` : ""}</small></div>;
}
