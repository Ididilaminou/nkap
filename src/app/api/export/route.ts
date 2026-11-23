import { getCtx } from "@/lib/activity";

export async function GET() {
  const { sb, act } = await getCtx();
  const { data } = await sb.from("sales").select("*").eq("activity_id", act.id).order("date", { ascending: false });
  const head = "date;montant;reste;paiement;canal\n";
  const rows = (data ?? [])
    .map((s: any) => [s.date, s.montant, s.reste, s.mode_paiement ?? "", s.canal ?? ""].join(";"))
    .join("\n");
  return new Response("\ufeff" + head + rows, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="ventes.csv"',
    },
  });
}