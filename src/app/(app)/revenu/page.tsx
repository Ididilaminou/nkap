import { getCtx } from "@/lib/activity";
import { loadData, fcfa } from "@/lib/data";
import { addOffer, deleteRow } from "../actions";

export default async function Revenu() {
  const { sb, act } = await getCtx();
  const d = await loadData(sb, act.id);
  const now = new Date();
  const debut = now.toISOString().slice(0, 7) + "-01";
  const mois = d.sales.filter((s) => s.date >= debut);
  const realise = mois.reduce((s, v) => s + v.montant, 0);
  const joursMois = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const projection = Math.round((realise / now.getDate()) * joursMois);
  const cout = new Map(d.offers.map((o) => [o.id, o.cout]));
  const marge = mois.reduce((s, v) => s + v.montant - (cout.get(v.offer_id) ?? 0), 0);
  const aEncaisser = d.sales.reduce((s, v) => s + (v.reste || 0), 0);

  const parOffre = d.offers
    .map((o) => {
      const ventes = mois.filter((s) => s.offer_id === o.id);
      return {
        id: o.id,
        nom: o.nom,
        n: ventes.length,
        ca: ventes.reduce((s, v) => s + v.montant, 0),
        marge: o.prix - o.cout,
      };
    })
    .sort((a, b) => b.ca - a.ca);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-2 text-sm">
        {[
          ["Réalisé ce mois", fcfa(realise)],
          ["Objectif", fcfa(act.objectif_mensuel)],
          ["Projection fin de mois", fcfa(projection)],
          ["Marge estimée", fcfa(marge)],
          ["À encaisser", fcfa(aEncaisser)],
        ].map(([l, v]) => (
          <div key={l} className="bg-white border rounded p-3">
            <p className="text-gray-500 text-xs">{l}</p>
            <b>{v}</b>
          </div>
        ))}
      </div>

      {projection < act.objectif_mensuel && realise > 0 && (
        <p className="text-sm bg-amber-50 border border-amber-200 rounded p-3">
          À ce rythme tu finis à {fcfa(projection)}, soit {fcfa(act.objectif_mensuel - projection)} sous ton objectif. Regarde les actions de l'onglet Aujourd'hui.
        </p>
      )}

      <section>
        <h2 className="font-semibold mb-2">Par offre (ce mois)</h2>
        <div className="space-y-2">
          {parOffre.map((o) => (
            <div key={o.id} className="bg-white border rounded p-2 text-sm flex items-center gap-2">
              <span className="flex-1">
                {o.nom} · {o.n} vente(s) · marge unitaire {fcfa(o.marge)}
              </span>
              <b>{fcfa(o.ca)}</b>
              <form action={deleteRow.bind(null, "offers", o.id)}>
                <button className="text-xs text-red-600">✕</button>
              </form>
            </div>
          ))}
          {!parOffre.length && <p className="text-sm text-gray-500">Aucune offre. Ajoutes-en une ci-dessous.</p>}
        </div>
      </section>

      <form action={addOffer.bind(null, act.id)} className="bg-white border rounded p-3 grid grid-cols-3 gap-2">
        <input name="nom" required placeholder="Nouvelle offre" className="border rounded p-2 col-span-3" />
        <input name="prix" type="number" placeholder="Prix" className="border rounded p-2" />
        <input name="cout" type="number" placeholder="Coût" className="border rounded p-2" />
        <button className="bg-green-700 text-white rounded">Ajouter</button>
      </form>
    </div>
  );
}