"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [["/", "Aujourd'hui"], ["/projets", "Projets"], ["/clients", "Clients"], ["/ventes", "Ventes"],
  ["/revenu", "Revenu"], ["/marche", "Marché"], ["/regles", "Règles"]];

export default function Nav() {
  const p = usePathname();
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t flex">
      {items.map(([h, l]) => (
        <Link key={h} href={h} className={`flex-1 text-center text-[11px] py-3 ${p === h ? "text-green-700 font-bold" : "text-gray-500"}`}>{l}</Link>
      ))}
    </nav>
  );
}