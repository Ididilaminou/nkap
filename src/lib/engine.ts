import { Row, Data, daysAgo, fcfa } from "./data";
import { msgRelance, msgReachat, msgPromo, msgImpaye } from "./messages";

export const RULES = [
  { code: "relance", titre: "Relance des prospects", desc: "Prospect intéressé ou en négociation sans réponse depuis 2 jours → tâche + message prêt" },
  { code: "reachat", titre: "Rachat des clients", desc: "Client sans achat depuis 30 jours → tâche de relance" },
  { code: "avis", titre: "Avis après achat", desc: "3 jours après une vente → demander un avis et proposer un 2e produit" },
  { code: "dormant", titre: "Produit dormant", desc: "Aucune vente d'une offre depuis 14 jours → tâche promo/statut" },
  { code: "impaye", titre: "Impayés à encaisser", desc: "Vente avec reste à payer depuis 3 jours → tâche pour encaisser + message prêt" },
  { code: "bilan", titre: "Bilan de fin de mois", desc: "À partir du 25 → bilan du mois et relance des impayés" },
];

export type Reco = {
  id: string; titre: string; detail: string; gain: number; minutes: number; score: number;
  wa?: { tel: string | null; text: string; contactId?: string };
};

export const panierMoyen = (d: Data) =>
  d.sales.length ? d.sales.reduce((s, x) => s + x.montant, 0) / d.sales.length : d.offers[0]?.prix ?? 0;

function lastBuyMap(d: Data) {
  const m = new Map<string, string>();
  for (const s of d.sales) if (s.contact_id && !m.has(s.contact_id)) m.set(s.contact_id, s.date);
  return m;
}

export function computeRecos(act: Row, d: Data): Reco[] {
  const out: Omit<Reco, "score">[] = [];
  const panier = panierMoyen(d);
  const offre = d.offers[0]?.nom ?? "notre offre";
  const last = lastBuyMap(d);

  for (const c of d.contacts) {
    const silence = daysAgo(c.derniere_interaction);
    if (["interesse", "negociation"].includes(c.stade) && silence >= 2) {
      const p = c.stade === "negociation" ? 0.5 : 0.25;
      out.push({
        id: `r-${c.id}`, titre: `Relancer ${c.nom}`, minutes: 5,
        detail: `${c.stade === "negociation" ? "En négociation" : "Intéressé(e)"}, sans nouvelle depuis ${silence} j`,
        gain: Math.round((c.valeur_estimee || panier) * p),
        wa: { tel: c.telephone, text: msgRelance(c.nom, offre, act.nom), contactId: c.id },
      });
    }
    if (c.stade === "client") {
      const gap = daysAgo(last.get(c.id) ?? c.derniere_interaction);
      if (gap >= 30)
        out.push({
          id: `b-${c.id}`, titre: `Relancer ${c.nom} (cliente dormante)`, minutes: 5,
          detail: `Pas d'achat depuis ${gap} jours`, gain: Math.round(panier * 0.3),
          wa: { tel: c.telephone, text: msgReachat(c.nom, act.nom), contactId: c.id },
        });
    }
  }
  for (const s of d.sales) {
    if (s.reste > 0 && daysAgo(s.date) >= 3) {
      const c = d.contacts.find((x) => x.id === s.contact_id);
      out.push({
        id: `i-${s.id}`, titre: `Encaisser ${fcfa(s.reste)}${c ? " chez " + c.nom : ""}`, minutes: 5,
        detail: `Reste à payer depuis ${daysAgo(s.date)} jours`, gain: s.reste,
        wa: { tel: c?.telephone ?? null, text: msgImpaye(c?.nom ?? "", s.reste, act.nom) },
      });
    }
  }
  for (const o of d.offers) {
    if (!d.sales.some((s) => s.offer_id === o.id && daysAgo(s.date) <= 14))
      out.push({
        id: `p-${o.id}`, titre: `Pousser « ${o.nom} »`, minutes: 20,
        detail: "Aucune vente depuis 14 jours : statut WhatsApp + promo", gain: Math.round(o.prix * 3 * 0.3),
        wa: { tel: null, text: msgPromo(o.nom, o.prix, act.nom) },
      });
  }
  return out.map((r) => ({ ...r, score: r.gain / r.minutes })).sort((a, b) => b.score - a.score);
}

export async function runAutomations(sb: any, act: Row, d: Data) {
  const { data: r } = await sb.from("automation_rules").select("code,actif").eq("activity_id", act.id);
  const off = new Set((r ?? []).filter((x: Row) => !x.actif).map((x: Row) => x.code));
  const wk = Math.floor(Date.now() / (7 * 864e5));
  const today = new Date().toISOString().slice(0, 10);
  const panier = panierMoyen(d);
  const last = lastBuyMap(d);
  const byId = new Map(d.contacts.map((c) => [c.id, c]));
  const out: Row[] = [];
  const add = (code: string, key: string, titre: string, gain = 0, prio = 2) => {
    if (!off.has(code))
      out.push({ activity_id: act.id, titre, priorite: prio, echeance: today, revenu_estime: Math.round(gain), source_key: `${code}:${key}` });
  };

  for (const c of d.contacts) {
    if (["interesse", "negociation"].includes(c.stade) && daysAgo(c.derniere_interaction) >= 2)
      add("relance", `${c.id}:${wk}`, `Relancer ${c.nom} sur WhatsApp`, (c.valeur_estimee || panier) * (c.stade === "negociation" ? 0.5 : 0.25), 1);
    if (c.stade === "client" && daysAgo(last.get(c.id) ?? c.derniere_interaction) >= 30)
      add("reachat", `${c.id}:${wk}`, `Relancer ${c.nom} (rachat)`, panier * 0.3);
  }
  for (const s of d.sales) {
    const j = daysAgo(s.date), c = byId.get(s.contact_id);
    if (c && j >= 3 && j <= 5) add("avis", s.id, `Demander un avis à ${c.nom} + proposer un 2e produit`, panier * 0.3);
  }
  for (const s of d.sales)
    if (s.reste > 0 && daysAgo(s.date) >= 3) add("impaye", `${s.id}:${wk}`, `Encaisser ${s.reste} FCFA restants`, s.reste, 1);
  for (const o of d.offers)
    if (!d.sales.some((s) => s.offer_id === o.id && daysAgo(s.date) <= 14))
      add("dormant", `${o.id}:${wk}`, `Promo sur « ${o.nom} » : publier un statut`, o.prix * 0.9);
  if (new Date().getDate() >= 25) {
    const m = new Date().toISOString().slice(0, 7);
    add("bilan", m, "Bilan du mois + relancer les impayés", 0, 1);
  }
  if (out.length) await sb.from("tasks").upsert(out, { onConflict: "activity_id,source_key", ignoreDuplicates: true });
}