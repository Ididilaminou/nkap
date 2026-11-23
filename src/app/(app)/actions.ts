"use server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { supabaseServer } from "@/lib/supabase/server";

const done = () => revalidatePath("/", "layout");
const today = () => new Date().toISOString().slice(0, 10);
const opt = (v: FormDataEntryValue | null) => String(v ?? "") || null;

export async function setActivity(id: string) {
  (await cookies()).set("act", id, { path: "/" });
  done();
}

export async function addTask(activityId: string, fd: FormData) {
  const sb = await supabaseServer();
  await sb.from("tasks").insert({
    activity_id: activityId, titre: String(fd.get("titre")),
    revenu_estime: Number(fd.get("revenu") || 0),
    echeance: opt(fd.get("echeance")) ?? today(),
    recurrence: opt(fd.get("recurrence")),
    project_id: opt(fd.get("project")),
  });
  done();
}

export async function toggleTask(id: string) {
  const sb = await supabaseServer();
  const { data: t } = await sb.from("tasks").update({ statut: "fait" }).eq("id", id).select().single();
  if (t?.recurrence) {
    const d = new Date(t.echeance ?? Date.now());
    if (t.recurrence === "daily") d.setDate(d.getDate() + 1);
    if (t.recurrence === "weekly") d.setDate(d.getDate() + 7);
    if (t.recurrence === "monthly") d.setMonth(d.getMonth() + 1);
    const { id: _i, created_at: _c, source_key: _s, ...rest } = t;
    await sb.from("tasks").insert({ ...rest, statut: "a_faire", echeance: d.toISOString().slice(0, 10) });
  }
  done();
}

export async function addContact(activityId: string, fd: FormData) {
  const sb = await supabaseServer();
  await sb.from("contacts").insert({
    activity_id: activityId, nom: String(fd.get("nom")),
    telephone: opt(fd.get("tel")),
    valeur_estimee: Number(fd.get("valeur") || 0),
    stade: String(fd.get("stade") || "prospect"),
  });
  done();
}

export async function setStage(id: string, stade: string) {
  const sb = await supabaseServer();
  await sb.from("contacts").update({ stade, derniere_interaction: new Date().toISOString() }).eq("id", id);
  done();
}

export async function touchContact(id: string) {
  const sb = await supabaseServer();
  await sb.from("contacts").update({ derniere_interaction: new Date().toISOString() }).eq("id", id);
  done();
}

export async function addOffer(activityId: string, fd: FormData) {
  const sb = await supabaseServer();
  await sb.from("offers").insert({
    activity_id: activityId, nom: String(fd.get("nom")),
    prix: Number(fd.get("prix") || 0), cout: Number(fd.get("cout") || 0),
  });
  done();
}

export async function addSale(activityId: string, fd: FormData) {
  const sb = await supabaseServer();
  const offerId = opt(fd.get("offer"));
  const contactId = opt(fd.get("contact"));
  let montant = Number(fd.get("montant") || 0);
  if (!montant && offerId) {
    const { data: o } = await sb.from("offers").select("prix").eq("id", offerId).single();
    montant = o?.prix ?? 0;
  }
  if (!montant) return;
  const reste = Math.min(Math.max(Number(fd.get("reste") || 0), 0), montant);
  await sb.from("sales").insert({
    activity_id: activityId, contact_id: contactId, offer_id: offerId, montant, reste,
    mode_paiement: opt(fd.get("paiement")), canal: opt(fd.get("canal")),
  });
  if (contactId)
    await sb.from("contacts").update({ stade: "client", derniere_interaction: new Date().toISOString() }).eq("id", contactId);
  done();
}

export async function markPaid(id: string) {
  const sb = await supabaseServer();
  await sb.from("sales").update({ reste: 0 }).eq("id", id);
  done();
}

export async function toggleRule(activityId: string, code: string, actif: boolean) {
  const sb = await supabaseServer();
  await sb.from("automation_rules").upsert({ activity_id: activityId, code, actif }, { onConflict: "activity_id,code" });
  done();
}

export async function addProject(activityId: string, fd: FormData) {
  const sb = await supabaseServer();
  await sb.from("projects").insert({
    activity_id: activityId, titre: String(fd.get("titre")), echeance: opt(fd.get("echeance")),
  });
  done();
}

export async function setProjectStatus(id: string, statut: string) {
  const sb = await supabaseServer();
  await sb.from("projects").update({ statut }).eq("id", id);
  done();
}

export async function addMilestone(projectId: string, fd: FormData) {
  const sb = await supabaseServer();
  await sb.from("milestones").insert({
    project_id: projectId, titre: String(fd.get("titre")), echeance: opt(fd.get("echeance")),
  });
  done();
}

export async function toggleMilestone(id: string, fait: boolean) {
  const sb = await supabaseServer();
  await sb.from("milestones").update({ fait }).eq("id", id);
  done();
}

export async function deleteRow(table: string, id: string) {
  if (!["tasks", "contacts", "sales", "offers", "projects", "milestones"].includes(table)) return;
  const sb = await supabaseServer();
  await sb.from(table).delete().eq("id", id);
  done();
}