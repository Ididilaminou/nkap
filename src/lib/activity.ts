import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseServer } from "./supabase/server";

export async function getCtx() {
  const sb: any = await supabaseServer();
  const { data: acts } = await sb.from("activities").select("*").order("created_at");
  if (!acts?.length) redirect("/onboarding");
  const id = (await cookies()).get("act")?.value;
  const act = acts.find((a: any) => a.id === id) ?? acts[0];
  return { sb, act, acts: acts as Row[] };
}
type Row = Record<string, any>;