"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"in" | "up">("in");
  const [err, setErr] = useState("");
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const sb = supabaseBrowser();
    const { error } =
      mode === "in"
        ? await sb.auth.signInWithPassword({ email, password })
        : await sb.auth.signUp({ email, password });
    if (error) return setErr(error.message);
    router.push("/");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-3">
        <h1 className="text-2xl font-bold">NKAP</h1>
        <input className="w-full border rounded p-2" type="email" placeholder="Email"
          value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="w-full border rounded p-2" type="password" placeholder="Mot de passe"
          value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
        {err && <p className="text-red-600 text-sm">{err}</p>}
        <button className="w-full bg-green-700 text-white rounded p-2">
          {mode === "in" ? "Se connecter" : "Créer mon compte"}
        </button>
        <button type="button" className="text-sm underline"
          onClick={() => setMode(mode === "in" ? "up" : "in")}>
          {mode === "in" ? "Pas de compte ? Inscris-toi" : "J'ai déjà un compte"}
        </button>
      </form>
    </main>
  );
}