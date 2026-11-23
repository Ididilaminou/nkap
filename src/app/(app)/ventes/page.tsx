import { getCtx } from "@/lib/activity";
import { loadData, fcfa } from "@/lib/data";
import { waLink, msgRecu } from "@/lib/messages";
import { addSale, markPaid, deleteRow } from "../actions";

const PAY: Record<string, string> = { mtn_momo: "MTN MoMo", orange_money: "Orange Money", cash: "Cash", livraison: "À la livraison" };

export default async function Ventes() {
  const { sb, act } = await getCtx();
  const d = await loadData(sb, act.id);
  const contact = (id: string) => d.contacts.find((c) => c.id === id);
  const nomOffre = (id: string) => d.offers.find((o) => o.id === id)?.nom ?? "";
  const aEncaisser = d.sales.reduce((s, v) => s + (v.reste || 0), 0);

  return (
    <div className="space-y-6">
      {aEncaisser > 0 && (
        <p className="text-sm bg-amber-50 border border-amber-200 rounded p-3">
          À encaisser : <b>{fcfa(aEncaisser)}</b>
        </p>
      )}

      <form action={addSale.bind(null, act.id)} className="bg-white border rounded p-3 grid grid-cols-2 gap-2">
        <select name="contact" className="border rounded p-2">
          <option value="">Client (optionnel)</option>
          {d.contacts.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
        </select>
        <select name="offer" className="border rounded p-2">
          <option value="">Offre</option>
          {d.offers.map((o) => <option key={o.id} value={o.id}>{o.nom} ({o.prix})</option>)}
        </select>
        <input name="montant" type="number" placeholder="Montant total (vide = prix de l'offre)" className="border rounded p-2 col-span-2" />
        <input name="reste" type="number" placeholder="Reste à payer (si acompte)" className="border rounded p-2 col-span-2" />
        <select name="paiement" className="border rounded p-2">
          {(act.paiements ?? []).map((p: string) => <option key={p} value={p}>{PAY[p] ?? p}</option>)}
        </select>
        <select name="canal" className="border rounded p-2">
          {(act.canaux ?? []).map((c: string) => <option key={c}>{c}</option>)}
        </select>
        <button className="col-span-2 bg-green-700 text-white rounded p-2">Enregistrer la vente</button>
      </form>

      <a href="/api/export" className="text-sm underline">Exporter les ventes en CSV</a>

      <ul className="space-y-2">
        {d.sales.slice(0, 40).map((s) => {
          const c = contact(s.contact_id);
          return (
            <li key={s.id} className="bg-white border rounded p-2 text-sm space-y-1">
              <div className="flex justify-between">
                <span>{s.date} · {c?.nom ?? "—"} · {nomOffre(s.offer_id) || "—"}</span>
                <b className="text-green-700">{fcfa(s.montant)}</b>
              </div>
              <div className="flex gap-2 items-center">
                {s.reste > 0 && (
                  <>
                    <span className="text-amber-700 text-xs">Reste {fcfa(s.reste)}</span>
                    <form action={markPaid.bind(null, s.id)}><button className="border rounded px-2 py-0.5 text-xs">Encaissé</button></form>
                  </>
                )}
                <a target="_blank" className="border rounded px-2 py-0.5 text-xs"
                  href={waLink(c?.telephone ?? null, msgRecu(c?.nom ?? "", nomOffre(s.offer_id), s.montant, s.reste || 0, act.nom))}>
                  Reçu WhatsApp
                </a>
                <form action={deleteRow.bind(null, "sales", s.id)} className="ml-auto">
                  <button className="text-xs text-red-600">Supprimer</button>
                </form>
              </div>
            </li>
          );
        })}
        {!d.sales.length && <li className="text-sm text-gray-500">Aucune vente enregistrée.</li>}
      </ul>
    </div>
  );
}