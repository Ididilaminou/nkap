import { getCtx } from "@/lib/activity";
import { fcfa } from "@/lib/data";
import { addProject, setProjectStatus, addMilestone, toggleMilestone, addTask, toggleTask, deleteRow } from "../actions";

export default async function Projets() {
  const { sb, act } = await getCtx();
  const { data: projects } = await sb.from("projects").select("*").eq("activity_id", act.id).order("statut").order("echeance");
  const ids = (projects ?? []).map((p: any) => p.id);
  const [{ data: tasks }, { data: miles }] = ids.length
    ? await Promise.all([
        sb.from("tasks").select("*").in("project_id", ids),
        sb.from("milestones").select("*").in("project_id", ids).order("echeance"),
      ])
    : [{ data: [] }, { data: [] }];

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <form action={addProject.bind(null, act.id)} className="bg-white border rounded p-3 flex gap-2">
        <input name="titre" required placeholder="Nouveau projet (ex: Lancement collection Noël)" className="flex-1 border rounded p-2" />
        <input name="echeance" type="date" className="border rounded p-2" />
        <button className="bg-green-700 text-white rounded px-3">+</button>
      </form>

      {(projects ?? []).map((p: any) => {
        const t = (tasks ?? []).filter((x: any) => x.project_id === p.id);
        const m = (miles ?? []).filter((x: any) => x.project_id === p.id);
        const total = t.length + m.length;
        const fait = t.filter((x: any) => x.statut === "fait").length + m.filter((x: any) => x.fait).length;
        const pct = total ? Math.round((fait / total) * 100) : 0;
        const reste = t.filter((x: any) => x.statut !== "fait");
        const gain = reste.reduce((s: number, x: any) => s + (x.revenu_estime || 0), 0);
        const jours = p.echeance ? Math.ceil((+new Date(p.echeance) - Date.now()) / 864e5) : null;
        const termine = p.statut === "termine";

        return (
          <section key={p.id} className={`bg-white border rounded p-3 space-y-3 ${termine ? "opacity-60" : ""}`}>
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <b>{p.titre}</b>
                <p className="text-xs text-gray-500">
                  {p.echeance ? (jours! < 0 ? <span className="text-red-600">en retard de {-jours!} j</span> : `échéance dans ${jours} j`) : "sans échéance"}
                  {gain > 0 && ` · ${fcfa(gain)} de gain attendu`}
                </p>
              </div>
              <form action={setProjectStatus.bind(null, p.id, termine ? "en_cours" : "termine")}>
                <button className="border rounded px-2 py-1 text-xs">{termine ? "Rouvrir" : "Terminer"}</button>
              </form>
              <form action={deleteRow.bind(null, "projects", p.id)}><button className="text-xs text-red-600">✕</button></form>
            </div>

            <div>
              <div className="h-2 bg-gray-200 rounded"><div className="h-2 bg-green-700 rounded" style={{ width: `${pct}%` }} /></div>
              <p className="text-xs text-gray-500 mt-1">{pct} % ({fait}/{total})</p>
            </div>

            <div>
              <p className="text-sm font-semibold mb-1">Jalons</p>
              <ul className="space-y-1 text-sm">
                {m.map((x: any) => (
                  <li key={x.id} className="flex items-center gap-2">
                    <form action={toggleMilestone.bind(null, x.id, !x.fait)}>
                      <button className={`w-5 h-5 border rounded ${x.fait ? "bg-green-700" : ""}`} aria-label="Valider" />
                    </form>
                    <span className={`flex-1 ${x.fait ? "line-through text-gray-400" : ""}`}>{x.titre}</span>
                    {x.echeance && <span className={`text-xs ${!x.fait && x.echeance < today ? "text-red-600" : "text-gray-500"}`}>{x.echeance}</span>}
                    <form action={deleteRow.bind(null, "milestones", x.id)}><button className="text-gray-400 text-xs">✕</button></form>
                  </li>
                ))}
              </ul>
              <form action={addMilestone.bind(null, p.id)} className="flex gap-2 mt-2">
                <input name="titre" required placeholder="Nouveau jalon" className="flex-1 border rounded p-1 text-sm" />
                <input name="echeance" type="date" className="border rounded p-1 text-sm" />
                <button className="border rounded px-2 text-sm">+</button>
              </form>
            </div>

            <div>
              <p className="text-sm font-semibold mb-1">Tâches ({reste.length} restantes)</p>
              <ul className="space-y-1 text-sm">
                {reste.map((x: any) => (
                  <li key={x.id} className="flex items-center gap-2">
                    <form action={toggleTask.bind(null, x.id)}><button className="w-5 h-5 border rounded-full" aria-label="Terminer" /></form>
                    <span className="flex-1">{x.titre}</span>
                    {x.revenu_estime > 0 && <span className="text-xs text-green-700">+{fcfa(x.revenu_estime)}</span>}
                  </li>
                ))}
              </ul>
              <form action={addTask.bind(null, act.id)} className="flex gap-2 mt-2">
                <input type="hidden" name="project" value={p.id} />
                <input name="titre" required placeholder="Nouvelle tâche" className="flex-1 border rounded p-1 text-sm" />
                <input name="echeance" type="date" className="border rounded p-1 text-sm" />
                <button className="border rounded px-2 text-sm">+</button>
              </form>
            </div>
          </section>
        );
      })}
      {!projects?.length && <p className="text-sm text-gray-500">Aucun projet. Crée-en un pour découper ton objectif en jalons.</p>}
    </div>
  );
}