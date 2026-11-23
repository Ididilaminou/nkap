"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

const SECTEURS = ["Vente de produits", "Restauration", "Services", "Agro", "Formation", "Autre"];
const CANAUX = ["whatsapp", "facebook", "tiktok", "terrain"];
const PAIEMENTS = [
  ["mtn_momo", "MTN MoMo"], ["orange_money", "Orange Money"],
  ["cash", "Cash"], ["livraison", "Paiement à la livraison"],
];

export default function Onboarding() {
  const router = useRouter();
  const [nom, setNom] = useState("");
  const [secteur, setSecteur] = useState(SECTEURS[0]);
  const [objectif, setObjectif] = useState(300000);
  const [canaux, setCanaux] = useState<string[]>(["whatsapp"]);
  const [paiements, setPaiements] = useState<string[]>(["mtn_momo", "orange_money"]);
  const [offre, setOffre] = useState({ nom: "", prix: 0, cout: 0 });
  const [loading, setLoading] = useState(false);

  const toggle = (list: string[], v: string, set: (l: string[]) => void) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const sb = supabaseBrowser();
    const { data: { user } } = await sb.auth.getUser();
    const { data: act, error } = await sb
      .from("activities")
      .insert({ user_id: user!.id, nom, secteur, objectif_mensuel: objectif, canaux, paiements })
      .select()
      .single();
    if (error) {
      setLoading(false);
      alert(error.message);
      return;
    }
    document.cookie = "act=" + act.id + "; path=/";
    if (offre.nom) await sb.from("offers").insert({ activity_id: act.id, ...offre });
    router.push("/");
    router.refresh();
  }

  const chip = (on: boolean) =>
    `px-3 py-1 rounded-full border text-sm ${on ? "bg-green-700 text-white" : ""}`;

  return (
    <main className="max-w-md mx-auto p-4 space-y-4">
      <h1 className="text-xl font-bold">Ton activité</h1>
      <form onSubmit={save} className="space-y-4">
        <input className="w-full border rounded p-2" placeholder="Nom (ex: Pagnes Mama Ngono)"
          value={nom} onChange={(e) => setNom(e.target.value)} required />
        <select className="w-full border rounded p-2" value={secteur}
          onChange={(e) => setSecteur(e.target.value)}>
          {SECTEURS.map((s) => <option key={s}>{s}</option>)}
        </select>
        <label className="block text-sm">Objectif de revenu mensuel (FCFA)
          <input type="number" className="w-full border rounded p-2 mt-1" value={objectif}
            onChange={(e) => setObjectif(+e.target.value)} />
        </label>
        <div>
          <p className="text-sm mb-1">Où tu vends</p>
          <div className="flex flex-wrap gap-2">
            {CANAUX.map((c) => (
              <button type="button" key={c} className={chip(canaux.includes(c))}
                onClick={() => toggle(canaux, c, setCanaux)}>{c}</button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm mb-1">Paiements acceptés</p>
          <div className="flex flex-wrap gap-2">
            {PAIEMENTS.map(([v, l]) => (
              <button type="button" key={v} className={chip(paiements.includes(v))}
                onClick={() => toggle(paiements, v, setPaiements)}>{l}</button>
            ))}
          </div>
        </div>
        <fieldset className="border rounded p-3 space-y-2">
          <legend className="text-sm px-1">Ton offre principale</legend>
          <input className="w-full border rounded p-2" placeholder="Nom du produit/service"
            value={offre.nom} onChange={(e) => setOffre({ ...offre, nom: e.target.value })} />
          <div className="flex gap-2">
            <input type="number" className="w-1/2 border rounded p-2" placeholder="Prix"
              onChange={(e) => setOffre({ ...offre, prix: +e.target.value })} />
            <input type="number" className="w-1/2 border rounded p-2" placeholder="Coût"
              onChange={(e) => setOffre({ ...offre, cout: +e.target.value })} />
          </div>
        </fieldset>
        <button disabled={loading} className="w-full bg-green-700 text-white rounded p-2">
          {loading ? "..." : "Commencer"}
        </button>
      </form>
    </main>
  );
}