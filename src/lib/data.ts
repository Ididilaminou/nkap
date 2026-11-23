export type Row = Record<string, any>;
export type Data = { offers: Row[]; contacts: Row[]; sales: Row[]; tasks: Row[] };

export const fcfa = (n: number) => new Intl.NumberFormat("fr-FR").format(Math.round(n)) + " FCFA";
export const daysAgo = (d: string | Date | null) =>
  d ? Math.floor((Date.now() - new Date(d).getTime()) / 864e5) : 999;

export async function loadData(sb: any, actId: string): Promise<Data> {
  const since = new Date(Date.now() - 120 * 864e5).toISOString().slice(0, 10);
  const [o, c, s, t] = await Promise.all([
    sb.from("offers").select("*").eq("activity_id", actId),
    sb.from("contacts").select("*").eq("activity_id", actId).order("derniere_interaction"),
    sb.from("sales").select("*").eq("activity_id", actId).gte("date", since).order("date", { ascending: false }),
    sb.from("tasks").select("*").eq("activity_id", actId).eq("statut", "a_faire"),
  ]);
  return { offers: o.data ?? [], contacts: c.data ?? [], sales: s.data ?? [], tasks: t.data ?? [] };
}