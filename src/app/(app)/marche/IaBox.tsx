"use client";
import { useState } from "react";

const TYPES = [["relance", "Message de relance WhatsApp"], ["statut", "Statut WhatsApp / post"],
  ["tiktok", "Idée de vidéo TikTok"], ["script", "Script de vente"]];

export default function IaBox() {
  const [type, setType] = useState("relance");
  const [extra, setExtra] = useState("");
  const [out, setOut] = useState("");
  const [loading, setLoading] = useState(false);

  async function go() {
    setLoading(true);
    const r = await fetch("/api/ia", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ type, extra }) });
    const j = await r.json();
    setOut(j.text ?? j.error ?? "Erreur");
    setLoading(false);
  }

  return (
    <section className="bg-white border rounded p-3 space-y-2">
      <h2 className="font-semibold">Générer un contenu</h2>
      <select value={type} onChange={(e) => setType(e.target.value)} className="w-full border rounded p-2">
        {TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      <input value={extra} onChange={(e) => setExtra(e.target.value)} placeholder="Précision (ex: promo -20 % ce week-end)" className="w-full border rounded p-2" />
      <button onClick={go} disabled={loading} className="w-full bg-green-700 text-white rounded p-2">{loading ? "..." : "Générer"}</button>
      {out && (
        <>
          <textarea readOnly value={out} className="w-full border rounded p-2 h-40 text-sm" />
          <a target="_blank" href={`https://wa.me/?text=${encodeURIComponent(out)}`} className="text-sm underline">Envoyer sur WhatsApp</a>
        </>
      )}
    </section>
  );
}