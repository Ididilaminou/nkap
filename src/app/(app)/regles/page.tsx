import { getCtx } from "@/lib/activity";
import { RULES } from "@/lib/engine";
import { toggleRule } from "../actions";

export default async function Regles() {
  const { sb, act } = await getCtx();
  const { data } = await sb.from("automation_rules").select("code,actif").eq("activity_id", act.id);
  const etat = new Map((data ?? []).map((r: any) => [r.code, r.actif]));

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600">Ces règles tournent à chaque ouverture de l'app et créent tes tâches automatiquement.</p>
      {RULES.map((r) => {
        const actif = etat.get(r.code) ?? true;
        return (
          <form key={r.code} action={toggleRule.bind(null, act.id, r.code, !actif)} className="bg-white border rounded p-3 flex items-center gap-3">
            <div className="flex-1"><b>{r.titre}</b><p className="text-xs text-gray-500">{r.desc}</p></div>
            <button className={`px-3 py-1 rounded-full text-sm border ${actif ? "bg-green-700 text-white" : ""}`}>{actif ? "Actif" : "Inactif"}</button>
          </form>
        );
      })}
    </div>
  );
}