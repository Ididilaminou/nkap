import { getCtx } from "@/lib/activity";
import { loadData, fcfa } from "@/lib/data";
import { computeRecos, runAutomations, panierMoyen } from "@/lib/engine";
import { waLink } from "@/lib/messages";
import { addTask, toggleTask, touchContact, deleteRow } from "./actions";

export default async function Today() {
  const { sb, act } = await getCtx();
  const d = await loadData(sb, act.id);
  await runAutomations(sb, act, d);

  const today = new Date().toISOString().slice(0, 10);
  const debut = today.slice(0, 7) + "-01";
  const [{ data: tasks }, { data: projects }] = await Promise.all([
    sb.from("tasks").select("*").eq("activity_id", act.id).eq("statut", "a_faire")
      .or(`echeance.lte.${today},echeance.is.null`).order("priorite").order("revenu_estime", { ascending: false }),
    sb.from("projects").select("id,titre").eq("activity_id", act.id).eq("statut", "en_cours"),
  ]);

  const realise = d.sales.filter((s) => s.date >= debut).reduce((s, v) => s + v.montant, 0);
  const manque = Math.max(act.objectif_mensuel - realise, 0);
  const pct = act.objectif_mensuel ? Math.min(100, Math.round((realise / act.objectif_mensuel) * 100)) : 0;
  const panier = panierMoyen(d);
  const nbVentes = panier ? Math.ceil(manque / panier) : 0;
  const recos = computeRecos(act, d).slice(0, 3);

  return (
    <div className="space-y-6">
      <section className="bg-white border rounded p-3">
        <div className="h-3 bg-gray-200 rounded"><div className="h-3 bg-green-700 rounded" style={{ width: `${pct}%` }} /></div>
        <p className="text-sm mt-2">{fcfa(realise)} / {fcfa(act.objectif_mensuel)} ({pct}%)</p>
        {manque > 0 && nbVentes > 0 && (
          <p className="text-sm text-gray-600">Il manque <b>{fcfa(manque)}</b>, soit environ {nbVentes} vente(s) à {fcfa(panier)}.</p>
        )}
      </section>

      <section>
        <h2 className="font-semibold mb-2">Top actions pour gagner de l'argent</h2>
        <div className="space-y-2">
          {recos.map((r) => (
            <div key={r.id} className="bg-white border rounded p-3 space-y-1">
              <div className="flex justify-between"><b>{r.titre}</b><span className="text-green-700 text-sm">+{fcfa(r.gain)}</span></div>
              <p className="text-xs text-gray-500">{r.detail} · {r.minutes} min</p>
              {r.wa && (
                <div className="flex gap-2 text-sm pt-1">
                  <a target="_blank" href={waLink(r.wa.tel, r.wa.text)} className="border rounded px-2 py-1">Ouvrir WhatsApp</a>
                  {r.wa.contactId && (
                    <form action={touchContact.bind(null, r.wa.contactId)}><button className="border rounded px-2 py-1">Fait</button></form>
                  )}
                </div>
              )}
            </div>
          ))}
          {!recos.length && <p className="text-sm text-gray-500">Ajoute des clients et des offres pour recevoir des actions ciblées.</p>}
        </div>
      </section>

      <section>
        <h2 className="font-semibold mb-2">Tâches du jour</h2>
        <ul className="space-y-2">
          {(tasks ?? []).map((t: any) => (
            <li key={t.id} className="flex items-center gap-3 bg-white border rounded p-2">
              <form action={toggleTask.bind(null, t.id)}><button className="w-6 h-6 border rounded-full" aria-label="Terminer" /></form>
              <span className="flex-1">{t.titre}{t.echeance && t.echeance < today && <em className="text-red-600 text-xs"> · en retard</em>}</span>
              {t.revenu_estime > 0 && <span className="text-xs text-green-700">+{fcfa(t.revenu_estime)}</span>}
              <form action={deleteRow.bind(null, "tasks", t.id)}><button className="text-gray-400 text-sm">✕</button></form>
            </li>
          ))}
          {!tasks?.length && <li className="text-sm text-gray-500">Rien pour aujourd'hui.</li>}
        </ul>
        <form action={addTask.bind(null, act.id)} className="grid grid-cols-2 gap-2 mt-3">
          <input name="titre" required placeholder="Nouvelle tâche" className="col-span-2 border rounded p-2 bg-white" />
          <input name="revenu" type="number" placeholder="Gain FCFA" className="border rounded p-2 bg-white" />
          <select name="recurrence" className="border rounded p-2 bg-white">
            <option value="">1 fois</option><option value="daily">Chaque jour</option>
            <option value="weekly">Chaque semaine</option><option value="monthly">Chaque mois</option>
          </select>
          <select name="project" className="border rounded p-2 bg-white">
            <option value="">Sans projet</option>
            {(projects ?? []).map((p: any) => <option key={p.id} value={p.id}>{p.titre}</option>)}
          </select>
          <button className="bg-green-700 text-white rounded p-2">Ajouter</button>
        </form>
      </section>
    </div>
  );
}