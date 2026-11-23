import { getCtx } from "@/lib/activity";
import { loadData, daysAgo, fcfa } from "@/lib/data";
import { waLink, msgRelance, msgReachat } from "@/lib/messages";
import { addContact, setStage, touchContact, deleteRow } from "../actions";

const STAGES = [["prospect", "Prospects"], ["interesse", "Intéressés"], ["negociation", "En négociation"], ["client", "Clients"]];

export default async function Clients() {
  const { sb, act } = await getCtx();
  const d = await loadData(sb, act.id);
  const offre = d.offers[0]?.nom ?? "notre offre";

  return (
    <div className="space-y-6">
      <form action={addContact.bind(null, act.id)} className="bg-white border rounded p-3 grid grid-cols-2 gap-2">
        <input name="nom" required placeholder="Nom" className="border rounded p-2" />
        <input name="tel" placeholder="Téléphone (6xx xx xx xx)" className="border rounded p-2" />
        <input name="valeur" type="number" placeholder="Valeur estimée FCFA" className="border rounded p-2" />
        <select name="stade" className="border rounded p-2">{STAGES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
        <button className="col-span-2 bg-green-700 text-white rounded p-2">Ajouter</button>
      </form>

      {STAGES.map(([code, label], i) => {
        const list = d.contacts.filter((c) => c.stade === code);
        const next = STAGES[i + 1];
        return (
          <section key={code}>
            <h2 className="font-semibold mb-2">{label} ({list.length})</h2>
            <div className="space-y-2">
              {list.map((c) => (
                <div key={c.id} className="bg-white border rounded p-3 space-y-2">
                  <div className="flex justify-between">
                    <b>{c.nom}</b>
                    <span className="text-xs text-gray-500">{daysAgo(c.derniere_interaction)} j sans contact</span>
                  </div>
                  {c.valeur_estimee > 0 && <p className="text-xs text-green-700">{fcfa(c.valeur_estimee)}</p>}
                  <div className="flex flex-wrap gap-2 text-sm">
                    <a target="_blank" className="border rounded px-2 py-1"
                      href={waLink(c.telephone, code === "client" ? msgReachat(c.nom, act.nom) : msgRelance(c.nom, offre, act.nom))}>WhatsApp</a>
                    <form action={touchContact.bind(null, c.id)}><button className="border rounded px-2 py-1">Contacté</button></form>
                    {next && (
                      <form action={setStage.bind(null, c.id, next[0])}>
                        <button className="border rounded px-2 py-1">→ {next[1]}</button>
                      </form>
                    )}
                    <form action={deleteRow.bind(null, "contacts", c.id)}>
                      <button className="border rounded px-2 py-1 text-red-600">Supprimer</button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}