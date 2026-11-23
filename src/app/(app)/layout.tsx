import Link from "next/link";
import { getCtx } from "@/lib/activity";
import { setActivity } from "./actions";
import Nav from "./Nav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { act, acts } = await getCtx();
  return (
    <div className="min-h-screen pb-20 bg-gray-50">
      <header className="bg-white border-b px-4 py-2 flex gap-2 overflow-x-auto items-center">
        {acts.map((a) => (
          <form key={a.id} action={setActivity.bind(null, a.id)}>
            <button className={`px-3 py-1 rounded-full text-sm border whitespace-nowrap ${a.id === act.id ? "bg-green-700 text-white" : ""}`}>
              {a.nom}
            </button>
          </form>
        ))}
        <Link href="/onboarding" className="px-3 py-1 text-sm border rounded-full">+</Link>
      </header>
      <div className="max-w-xl mx-auto p-4">{children}</div>
      <Nav />
    </div>
  );
}