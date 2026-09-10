"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export type Plan = { id: string; name: string; updated_at: string };

// Crear, renombrar y borrar se hacen desde el cliente, contra Supabase con RLS.
//
// Antes esto usaba Server Actions y fallaba de forma silenciosa: si el
// estudiante escribía el nombre y apretaba Enter antes de que la página
// terminara de hidratarse, el navegador enviaba el formulario de manera nativa,
// el nombre se perdía (quedaba "Mi plan estratégico") y podían crearse
// duplicados. La confirmación de borrado corría el mismo riesgo de no
// ejecutarse. Manejarlo en el cliente elimina esa ventana.
export default function PlanManager({ initialPlans }: { initialPlans: Plan[] }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [plans, setPlans] = useState<Plan[]>(initialPlans);
  const [newName, setNewName] = useState("");
  const [renaming, setRenaming] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function fail(e: unknown) {
    setError(
      e instanceof Error && e.message
        ? e.message
        : "No pudimos completar la acción. Revisá tu conexión y probá de nuevo."
    );
  }

  async function createPlan(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      const { data, error } = await supabase
        .from("plans")
        .insert({
          user_id: user.id,
          name: newName.trim() || "Mi plan estratégico",
        })
        .select("id")
        .single();
      if (error) throw error;
      router.push(`/plan/${data.id}/paso/1`);
    } catch (e) {
      fail(e);
      setBusy(false);
    }
  }

  async function renamePlan(e: React.FormEvent, id: string) {
    e.preventDefault();
    const name = (renaming[id] ?? "").trim();
    if (!name || busy) return;
    setBusy(true);
    setError(null);
    try {
      const { error } = await supabase.from("plans").update({ name }).eq("id", id);
      if (error) throw error;
      setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)));
      setRenaming((prev) => ({ ...prev, [id]: "" }));
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  }

  async function deletePlan(plan: Plan) {
    const ok = window.confirm(
      `¿Seguro que querés borrar «${plan.name}»?\n\nSe va a eliminar todo el trabajo cargado en ese plan y no se puede deshacer.`
    );
    if (!ok || busy) return;
    setBusy(true);
    setError(null);
    try {
      const { error } = await supabase.from("plans").delete().eq("id", plan.id);
      if (error) throw error;
      setPlans((prev) => prev.filter((p) => p.id !== plan.id));
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <form onSubmit={createPlan} className="flex gap-2" data-tour="new-plan">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nombre de la empresa / proyecto"
          className="flex-1 rounded-lg border px-4 py-2"
        />
        <button
          disabled={busy}
          className="rounded-lg bg-[#1F2465] text-white px-4 py-2 font-medium hover:bg-[#3a4487] disabled:opacity-50"
        >
          {busy ? "Un momento…" : "Nuevo plan"}
        </button>
      </form>

      {error && (
        <p className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <ul className="space-y-3">
        {plans.map((p, i) => (
          <li
            key={p.id}
            className="rounded-lg border p-4 space-y-3"
            data-tour={i === 0 ? "plan-card" : undefined}
          >
            <Link href={`/plan/${p.id}/paso/1`} className="block hover:opacity-80">
              <span className="font-medium text-lg">{p.name}</span>
              <span className="block text-sm opacity-60">
                Actualizado: {new Date(p.updated_at).toLocaleDateString("es")}
              </span>
            </Link>
            <div
              className="flex flex-wrap items-center gap-2 text-sm"
              data-tour={i === 0 ? "plan-actions" : undefined}
            >
              <Link
                href={`/plan/${p.id}/paso/1`}
                className="rounded bg-[#1F2465] text-white px-3 py-1 hover:bg-[#3a4487]"
              >
                Abrir
              </Link>
              <Link
                href={`/plan/${p.id}/resumen`}
                className="rounded border px-3 py-1 hover:bg-gray-50 dark:hover:bg-gray-900"
              >
                Resumen
              </Link>
              <form onSubmit={(e) => renamePlan(e, p.id)} className="flex gap-1">
                <input
                  value={renaming[p.id] ?? ""}
                  onChange={(e) =>
                    setRenaming((prev) => ({ ...prev, [p.id]: e.target.value }))
                  }
                  placeholder="Nuevo nombre…"
                  className="rounded border px-2 py-1 w-40"
                />
                <button
                  disabled={busy}
                  className="rounded border px-2 py-1 hover:bg-gray-50 dark:hover:bg-gray-900 disabled:opacity-50"
                >
                  Renombrar
                </button>
              </form>
              <button
                type="button"
                onClick={() => deletePlan(p)}
                disabled={busy}
                className="ml-auto rounded border border-red-300 text-red-600 px-3 py-1 hover:bg-red-50 disabled:opacity-50"
              >
                🗑 Borrar
              </button>
            </div>
          </li>
        ))}
        {plans.length === 0 && (
          <p className="opacity-60">Todavía no tenés planes. Creá el primero.</p>
        )}
      </ul>
    </>
  );
}
