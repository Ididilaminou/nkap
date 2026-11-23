import { NextResponse } from "next/server";
import { getCtx } from "@/lib/activity";
import { loadData } from "@/lib/data";

const TACHES: Record<string, string> = {
  relance: "Écris un court message WhatsApp de relance pour un client qui n'a pas répondu.",
  statut: "Écris un statut WhatsApp ou post Facebook qui donne envie d'acheter, avec un appel à l'action clair.",
  tiktok: "Donne 3 idées de vidéos TikTok courtes (30 s) faisables avec un téléphone, avec accroche et déroulé.",
  script: "Écris un script court pour convaincre un client hésitant, en gérant l'objection « c'est cher ».",
};

export async function POST(req: Request) {
  const { type, extra } = await req.json();
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: "Clé ANTHROPIC_API_KEY manquante dans .env.local" });

  const { sb, act } = await getCtx();
  const d = await loadData(sb, act.id);
  const offres = d.offers.map((o) => `${o.nom} (${o.prix} FCFA)`).join(", ") || "non renseignées";

  const system =
    "Tu écris pour un petit entrepreneur à Yaoundé, Cameroun. Français simple et naturel, comme un vrai vendeur camerounais qui parle à ses clients. " +
    "Messages courts, chaleureux, jamais de ton corporate ni de phrases creuses, pas d'emojis en excès. Prix en FCFA, paiement MTN MoMo / Orange Money. " +
    "Donne uniquement le contenu demandé, sans introduction.";
  const user = `Activité : ${act.nom} (${act.secteur}). Offres : ${offres}. Canaux : ${(act.canaux ?? []).join(", ")}.\n${TACHES[type] ?? TACHES.statut}\n${extra ?? ""}`;

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5-5", max_tokens: 500, system, messages: [{ role: "user", content: user }] }),
  });
  const j = await r.json();
  if (!r.ok) return NextResponse.json({ error: j?.error?.message ?? "Erreur API" });
  return NextResponse.json({ text: j.content?.[0]?.text ?? "" });
}