import { createClient } from "@/lib/supabase/server";
import { gridTotal, recommendedStrategy, Relation } from "@/lib/scoring";
import Link from "next/link";
import PrintButton from "@/components/PrintButton";
import { redirect } from "next/navigation";

export default async function Resumen({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: plan }, { data: sections }, { data: objectives },
    { data: swot }, { data: matrix }, { data: came }] = await Promise.all([
    supabase.from("plans").select("*").eq("id", id).single(),
    supabase.from("plan_sections").select("section, content").eq("plan_id", id),
    supabase.from("objectives").select("position, general, specific").eq("plan_id", id).order("position"),
    supabase.from("swot_items").select("kind, position, text").eq("plan_id", id),
    supabase.from("cross_matrix").select("relation, grid").eq("plan_id", id),
    supabase.from("came_actions").select("letter, position, text").eq("plan_id", id),
  ]);

  if (!plan) redirect("/dashboard");

  const sec = (s: string) =>
    sections?.find((x) => x.section === s)?.content || "—";
  const swotOf = (kind: string) =>
    (swot ?? []).filter((s) => s.kind === kind && s.text).sort((a, b) => a.position - b.position);

  const totals = { FO: 0, FA: 0, DO: 0, DA: 0 } as Record<Relation, number>;
  (matrix ?? []).forEach((m) => (totals[m.relation as Relation] = gridTotal(m.grid)));
  const strategy = recommendedStrategy(totals);

  const cameGroups: [string, string][] = [
    ["C", "Corregir las debilidades"], ["A", "Afrontar las amenazas"],
    ["M", "Mantener las fortalezas"], ["E", "Explotar las oportunidades"],
  ];

  return (
    <main className="max-w-3xl mx-auto p-8 space-y-8 print:p-0">
      <div className="flex flex-wrap gap-3 justify-between items-center print:hidden">
        <Link href={`/plan/${id}/paso/10`} className="opacity-70">← Volver al plan</Link>
        <PrintButton />
      </div>

      <header className="text-center border-b pb-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/Logo-FCE-UNaM.png"
          alt="Facultad de Ciencias Económicas — UNaM"
          className="h-16 w-auto mx-auto mb-4"
        />
        <h1 className="text-3xl font-bold">Resumen Ejecutivo del Plan Estratégico</h1>
        <p className="mt-2 text-xl">{plan.name}</p>
        <p className="text-sm opacity-70">
          {plan.authors && <>Autores: {plan.authors} · </>}
          Fecha: {new Date(plan.elaboration_date).toLocaleDateString("es")}
        </p>
      </header>

      <Section title="Misión">{sec("mision")}</Section>
      <Section title="Visión">{sec("vision")}</Section>
      <Section title="Valores">{sec("valores")}</Section>
      <Section title="Unidades estratégicas">{sec("uen")}</Section>

      <section>
        <h2 className="text-xl font-bold mb-2">Objetivos estratégicos</h2>
        <ul className="list-disc pl-6 space-y-1">
          {(objectives ?? []).filter((o) => o.general).map((o) => (
            <li key={o.position}>
              <b>{o.general}</b>
              {o.specific && <span className="block text-sm opacity-80">{o.specific}</span>}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-2">Análisis FODA</h2>
        <div className="grid grid-cols-2 gap-4">
          {([["F", "Fortalezas"], ["D", "Debilidades"], ["O", "Oportunidades"], ["A", "Amenazas"]] as const).map(
            ([k, label]) => (
              <div key={k} className="rounded-lg border p-4">
                <p className="font-semibold">{label}</p>
                <ul className="list-disc pl-5 text-sm">
                  {swotOf(k).map((s) => <li key={s.position}>{s.text}</li>)}
                </ul>
              </div>
            )
          )}
        </div>
      </section>

      <section
        className={`rounded-lg border p-4 ${
          strategy
            ? "bg-green-50 border-green-200 text-green-900"
            : "bg-amber-50 border-amber-200 text-amber-900"
        }`}
      >
        <h2 className="text-xl font-bold">Estrategia identificada</h2>
        {strategy ? (
          <p>
            <b>{strategy.name}</b> ({strategy.relation}, {strategy.score} puntos):{" "}
            {strategy.description}
          </p>
        ) : (
          <p>
            Todavía no está determinada. Completá la matriz cruzada del{" "}
            <b>paso 9</b> para que el sistema identifique tu estrategia.
          </p>
        )}
      </section>

      <section>
        <h2 className="text-xl font-bold mb-2">Acciones competitivas (CAME)</h2>
        {cameGroups.map(([letter, label]) => {
          const actions = (came ?? [])
            .filter((c) => c.letter === letter && c.text)
            .sort((a, b) => a.position - b.position);
          if (!actions.length) return null;
          return (
            <div key={letter} className="mb-3">
              <p className="font-semibold">{label}</p>
              <ol className="list-decimal pl-6 text-sm">
                {actions.map((a) => <li key={a.position}>{a.text}</li>)}
              </ol>
            </div>
          );
        })}
      </section>

      <footer className="border-t pt-4 text-sm opacity-70">
        Elaborado con la Metodología de Plan Estratégico · Cátedra de
        Administración · FCE — Universidad Nacional de Misiones
      </footer>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-bold mb-2">{title}</h2>
      <p className="whitespace-pre-wrap">{children}</p>
    </section>
  );
}
