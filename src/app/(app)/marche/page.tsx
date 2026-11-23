import { getCtx } from "@/lib/activity";
import { loadData } from "@/lib/data";
import { PLAYBOOKS, EVENTS } from "@/lib/playbooks";
import IaBox from "./IaBox";

const PAY: Record<string, string> = { mtn_momo: "MTN MoMo", orange_money: "Orange Money", cash: "Cash", livraison: "À la livraison" };

function part(list: any[], key: string) {
  const m: Record<string, number> = {};
  let tot = 0;
  for (const s of list) { const k = s[key]; if (!k) continue; m[k] = (m[k] ?? 0) + s.montant; tot += s.montant; }
  return Object.entries(m).map(([k, v]) => ({ k, pct: Math.round((v / tot) * 100) })).sort((a, b) => b.pct - a.pct);
}

export default async function Marche() {
  const { sb, act } = await getCtx();
  const d = await loadData(sb, act.id);
  const canaux = part(d.sales, "canal");
  const paiements = part(d.sales, "mode_paiement");

  const conseils: string[] = [];
  if (canaux[0]?.pct >= 60) conseils.push(`${canaux[0].pct} % de tes ventes viennent de ${canaux[0].k} : concentre ton énergie là-dessus avant d'ouvrir un autre canal.`);
  for (const c of act.canaux ?? []) if (d.sales.length >= 5 && !canaux.some((x) => x.k === c))
    conseils.push(`Tu es sur ${c} mais aucune vente enregistrée par ce canal : teste-le 2 semaines avec une offre précise, ou abandonne-le.`);
  if ((act.paiements ?? []).includes("livraison"))
    conseils.push("Tu acceptes le paiement à la livraison : demande un acompte MoMo/OM (ex. 30 %) pour réduire les colis refusés.");
  if (!(act.paiements ?? []).some((p: string) => ["mtn_momo", "orange_money"].includes(p)))
    conseils.push("Accepte MTN MoMo et Orange Money : beaucoup de clients paient plus facilement par Mobile Money que par cash.");
  if (d.sales.length < 5) conseils.push("Enregistre au moins 5 ventes (avec canal et mode de paiement) pour débloquer des analyses précises.");

  const now = new Date();
  const proches = EVENTS.map((e) => {
    let dt = new Date(now.getFullYear(), e.m - 1, e.j);
    if (dt < now) dt = new Date(now.getFullYear() + 1, e.m - 1, e.j);
    return { ...e, dans: Math.ceil((+dt - +now) / 864e5) };
  }).filter((e) => e.dans <= 60).sort((a, b) => a.dans - b.dans);

  return (
    <div className="space-y-6">
      <section>
        <h2 className="font-semibold mb-2">Tes conseils</h2>
        <ul className="space-y-2 text-sm">{conseils.map((c) => <li key={c} className="bg-white border rounded p-3">{c}</li>)}</ul>
      </section>

      <section className="grid grid-cols-2 gap-2 text-sm">
        {[["Canaux", canaux, (k: string) => k], ["Paiements", paiements, (k: string) => PAY[k] ?? k]].map(([t, l, f]: any) => (
          <div key={t} className="bg-white border rounded p-3">
            <p className="font-semibold mb-1">{t}</p>
            {l.map((x: any) => <p key={x.k}>{f(x.k)} : {x.pct} %</p>)}
            {!l.length && <p className="text-gray-500">Pas de données</p>}
          </div>
        ))}
      </section>

      <section>
        <h2 className="font-semibold mb-2">Calendrier à préparer</h2>
        <ul className="space-y-2 text-sm">
          {proches.map((e) => <li key={e.nom} className="bg-white border rounded p-3"><b>{e.nom}</b> (dans {e.dans} j) : {e.conseil}</li>)}
          {!proches.length && <li className="text-gray-500">Aucun événement majeur dans les 60 prochains jours.</li>}
        </ul>
        <p className="text-xs text-gray-500 mt-1">Ramadan, Tabaski, Pâques : dates variables, vérifie le calendrier de l'année.</p>
      </section>

      <section>
        <h2 className="font-semibold mb-2">Pratiques pour « {act.secteur} »</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm">{(PLAYBOOKS[act.secteur] ?? PLAYBOOKS.Autre).map((p) => <li key={p}>{p}</li>)}</ul>
      </section>

      <IaBox />
    </div>
  );
}