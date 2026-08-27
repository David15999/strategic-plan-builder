"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { STEPS, INTRO } from "@/lib/steps";
import contenido from "@/lib/content/contenido.json";
import {
  Answers,
  Relation,
  STRATEGIES,
  gridTotal,
  porterConclusion,
  porterTotal,
  potencialMejora,
  recommendedStrategy,
} from "@/lib/scoring";

type Swot = Record<string, string>; // "F1" -> texto

const SCALE_LABELS = [
  "En total desacuerdo",
  "No está de acuerdo",
  "Está de acuerdo",
  "Bastante de acuerdo",
  "En total acuerdo",
];

export default function PasoPage({
  params,
}: {
  params: Promise<{ id: string; n: string }>;
}) {
  const { id: planId, n } = use(params);
  const stepN = Math.min(Math.max(parseInt(n) || 1, 1), 10);
  const step = STEPS[stepN - 1];
  const supabase = useMemo(() => createClient(), []);

  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Estado por tipo de paso
  const [text, setText] = useState("");
  const [objectives, setObjectives] = useState(
    [1, 2, 3].map((p) => ({ position: p, general: "", specific: "" }))
  );
  const [answers, setAnswers] = useState<Answers>({});
  const [swot, setSwot] = useState<Swot>({});
  const [grids, setGrids] = useState<Record<Relation, Record<string, number>>>({
    FO: {}, FA: {}, DO: {}, DA: {},
  });
  const [came, setCame] = useState<Record<string, string>>({});

  const assessmentType =
    step.slug === "cadena-valor" ? "cadena_valor" : step.slug === "pest" ? "pest" : "porter";
  const questions: string[] =
    step.slug === "pest" ? contenido.pest : contenido.cadena_valor;

  // Carga inicial del paso
  useEffect(() => {
    let cancel = false;
    async function load() {
      setLoaded(false);
      if (step.kind === "text") {
        const { data } = await supabase
          .from("plan_sections").select("content")
          .eq("plan_id", planId).eq("section", step.slug).maybeSingle();
        if (!cancel) setText(data?.content ?? "");
      } else if (step.kind === "objectives") {
        const [{ data: uen }, { data: objs }] = await Promise.all([
          supabase.from("plan_sections").select("content")
            .eq("plan_id", planId).eq("section", "uen").maybeSingle(),
          supabase.from("objectives").select("position, general, specific")
            .eq("plan_id", planId).order("position"),
        ]);
        if (!cancel) {
          setText(uen?.content ?? "");
          if (objs?.length)
            setObjectives([1, 2, 3].map((p) =>
              objs.find((o) => o.position === p) ?? { position: p, general: "", specific: "" }));
        }
      } else if (step.kind === "assessment" || step.kind === "porter") {
        const [{ data: a }, { data: s }] = await Promise.all([
          supabase.from("assessments").select("answers")
            .eq("plan_id", planId).eq("type", assessmentType).maybeSingle(),
          supabase.from("swot_items").select("kind, position, text").eq("plan_id", planId),
        ]);
        if (!cancel) {
          setAnswers((a?.answers as Answers) ?? {});
          const sw: Swot = {};
          (s ?? []).forEach((r) => (sw[`${r.kind}${r.position}`] = r.text));
          setSwot(sw);
        }
      } else if (step.kind === "matrix") {
        const [{ data: g }, { data: s }] = await Promise.all([
          supabase.from("cross_matrix").select("relation, grid").eq("plan_id", planId),
          supabase.from("swot_items").select("kind, position, text").eq("plan_id", planId),
        ]);
        if (!cancel) {
          const next = { FO: {}, FA: {}, DO: {}, DA: {} } as typeof grids;
          (g ?? []).forEach((r) => (next[r.relation as Relation] = r.grid));
          setGrids(next);
          const sw: Swot = {};
          (s ?? []).forEach((r) => (sw[`${r.kind}${r.position}`] = r.text));
          setSwot(sw);
        }
      } else if (step.kind === "came") {
        const { data } = await supabase
          .from("came_actions").select("letter, position, text").eq("plan_id", planId);
        if (!cancel) {
          const c: Record<string, string> = {};
          (data ?? []).forEach((r) => (c[`${r.letter}${r.position}`] = r.text));
          setCame(c);
        }
      }
      if (!cancel) setLoaded(true);
    }
    load();
    return () => { cancel = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planId, stepN]);

  // Guardado
  const save = useCallback(async () => {
    setSaving(true);
    try {
      if (step.kind === "text") {
        await supabase.from("plan_sections")
          .upsert({ plan_id: planId, section: step.slug, content: text });
      } else if (step.kind === "objectives") {
        await Promise.all([
          supabase.from("plan_sections")
            .upsert({ plan_id: planId, section: "uen", content: text }),
          ...objectives.map((o) =>
            supabase.from("objectives").upsert(
              { plan_id: planId, ...o },
              { onConflict: "plan_id, position", ignoreDuplicates: false }
            )
          ),
        ]);
      } else if (step.kind === "assessment" || step.kind === "porter") {
        await supabase.from("assessments")
          .upsert({ plan_id: planId, type: assessmentType, answers });
        await Promise.all(
          Object.entries(swot).map(([key, value]) =>
            supabase.from("swot_items").upsert({
              plan_id: planId, kind: key[0], position: parseInt(key[1]), text: value,
            })
          )
        );
      } else if (step.kind === "matrix") {
        await Promise.all(
          (Object.keys(grids) as Relation[]).map((rel) =>
            supabase.from("cross_matrix")
              .upsert({ plan_id: planId, relation: rel, grid: grids[rel] })
          )
        );
      } else if (step.kind === "came") {
        await Promise.all(
          Object.entries(came).map(([key, value]) =>
            supabase.from("came_actions").upsert({
              plan_id: planId, letter: key[0], position: parseInt(key[1]), text: value,
            })
          )
        );
      }
    } finally {
      setSaving(false);
    }
  }, [step, text, objectives, answers, swot, grids, came, planId, supabase, assessmentType]);

  // Campos FODA que se cargan en cada paso
  const swotKeys =
    step.slug === "cadena-valor"
      ? ["F1", "F2", "F3", "F4", "D1", "D2", "D3", "D4"]
      : step.slug === "porter"
        ? ["O1", "O2", "A1", "A2"]
        : step.slug === "pest"
          ? ["O3", "O4", "A3", "A4"]
          : [];

  const matrixDefs: { rel: Relation; rows: string[]; cols: string[]; hint: string }[] = [
    { rel: "FO", rows: ["F1","F2","F3","F4"], cols: ["O1","O2","O3","O4"], hint: "Las fortalezas se usan para tomar ventaja de cada oportunidad." },
    { rel: "FA", rows: ["F1","F2","F3","F4"], cols: ["A1","A2","A3","A4"], hint: "Las fortalezas evaden el efecto negativo de las amenazas." },
    { rel: "DO", rows: ["D1","D2","D3","D4"], cols: ["O1","O2","O3","O4"], hint: "Superamos las debilidades tomando ventaja de las oportunidades." },
    { rel: "DA", rows: ["D1","D2","D3","D4"], cols: ["A1","A2","A3","A4"], hint: "Las debilidades intensifican el efecto negativo de las amenazas." },
  ];

  const totals = {
    FO: gridTotal(grids.FO), FA: gridTotal(grids.FA),
    DO: gridTotal(grids.DO), DA: gridTotal(grids.DA),
  };

  return (
    <div className="flex min-h-screen">
      {/* Stepper lateral */}
      <aside className="w-64 shrink-0 border-r p-4 hidden md:block">
        <Link href="/dashboard" className="text-sm opacity-60 hover:opacity-100">← Mis planes</Link>
        <nav className="mt-4 space-y-1">
          {STEPS.map((s) => (
            <Link key={s.n} href={`/plan/${planId}/paso/${s.n}`}
              className={`block rounded px-3 py-2 text-sm ${s.n === stepN ? "bg-[#1F2465] text-white" : "hover:bg-gray-100 dark:hover:bg-gray-900"}`}>
              {s.n}. {s.title}
            </Link>
          ))}
          <Link href={`/plan/${planId}/resumen`}
            className="block rounded px-3 py-2 text-sm font-medium text-[#1F2465] dark:text-[#8f9bd8] hover:bg-[#eae8f6]">
            📄 Resumen ejecutivo
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-6 md:p-10 max-w-4xl space-y-6">
        <h1 className="text-2xl font-bold">{step.n}. {step.title}</h1>
        <p className="opacity-80">{INTRO[step.slug]}</p>
        {!loaded ? (
          <p className="opacity-60">Cargando…</p>
        ) : (
          <>
            {step.kind === "text" && (
              <textarea value={text} onChange={(e) => setText(e.target.value)} onBlur={save}
                rows={10} className="w-full rounded-lg border p-4"
                placeholder={`Escriba aquí la ${step.title.toLowerCase()} de su empresa…`} />
            )}

            {step.kind === "objectives" && (
              <div className="space-y-4">
                {objectives.map((o, i) => (
                  <div key={o.position} className="rounded-lg border p-4 space-y-2">
                    <p className="font-medium">Objetivo {o.position}</p>
                    <input value={o.general} placeholder="Objetivo general o estratégico"
                      onChange={(e) => setObjectives((prev) => prev.map((x, j) => j === i ? { ...x, general: e.target.value } : x))}
                      onBlur={save} className="w-full rounded border px-3 py-2" />
                    <textarea value={o.specific} placeholder="Objetivos específicos" rows={2}
                      onChange={(e) => setObjectives((prev) => prev.map((x, j) => j === i ? { ...x, specific: e.target.value } : x))}
                      onBlur={save} className="w-full rounded border px-3 py-2" />
                  </div>
                ))}
                <div>
                  <p className="font-medium mb-1">Unidades Estratégicas de Negocio (UEN)</p>
                  <textarea value={text} onChange={(e) => setText(e.target.value)} onBlur={save}
                    rows={3} className="w-full rounded-lg border p-3"
                    placeholder="Si corresponde, comente las distintas UEN de su empresa…" />
                </div>
              </div>
            )}

            {step.kind === "info" && (
              <Link href={`/plan/${planId}/paso/6`}
                className="inline-block rounded-lg bg-[#1F2465] text-white px-5 py-2 hover:bg-[#3a4487]">
                Comenzar autodiagnósticos →
              </Link>
            )}

            {step.kind === "assessment" && (
              <div className="space-y-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left">
                        <th className="p-2">Afirmación</th>
                        {SCALE_LABELS.map((l, v) => (
                          <th key={v} className="p-2 text-center w-16" title={l}>{v}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {questions.map((q, i) => (
                        <tr key={i} className="border-t">
                          <td className="p-2">{i + 1}. {q}</td>
                          {[0, 1, 2, 3, 4].map((v) => (
                            <td key={v} className="text-center">
                              <input type="radio" name={`q${i}`} checked={answers[String(i)] === v}
                                onChange={() => setAnswers((a) => ({ ...a, [String(i)]: v }))} />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-blue-900">
                  Potencial de mejora: <b>{Math.round(potencialMejora(answers) * 100)}%</b>
                </p>
                <SwotInputs keys={swotKeys} swot={swot} setSwot={setSwot} onBlur={save} />
                <button onClick={save} className="rounded-lg bg-[#1F2465] text-white px-5 py-2 hover:bg-[#3a4487]">
                  {saving ? "Guardando…" : "Guardar"}
                </button>
              </div>
            )}

            {step.kind === "porter" && (
              <div className="space-y-6">
                {Array.from(new Set(contenido.porter.map((f) => f.group))).map((group) => (
                  <div key={group ?? "otros"} className="rounded-lg border p-4">
                    <p className="font-semibold mb-2">{group}</p>
                    {contenido.porter.map((f, i) =>
                      f.group !== group ? null : (
                        <div key={i} className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 py-1 text-sm">
                          <span className="text-right opacity-70">{f.label}: {f.anchors[0]}</span>
                          <span className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((v) => (
                              <input key={v} type="radio" name={`p${i}`} checked={answers[String(i)] === v}
                                onChange={() => setAnswers((a) => ({ ...a, [String(i)]: v }))} />
                            ))}
                          </span>
                          <span className="opacity-70">{f.anchors[1]}</span>
                        </div>
                      )
                    )}
                  </div>
                ))}
                <p className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-blue-900">
                  Total: <b>{porterTotal(answers)}</b> — {porterConclusion(porterTotal(answers))}
                </p>
                <SwotInputs keys={swotKeys} swot={swot} setSwot={setSwot} onBlur={save} />
                <button onClick={save} className="rounded-lg bg-[#1F2465] text-white px-5 py-2 hover:bg-[#3a4487]">
                  {saving ? "Guardando…" : "Guardar"}
                </button>
              </div>
            )}

            {step.kind === "matrix" && (
              <div className="space-y-8">
                {matrixDefs.map(({ rel, rows, cols, hint }) => (
                  <div key={rel} className="rounded-lg border p-4">
                    <p className="font-semibold">{rel} — {STRATEGIES[rel].name}</p>
                    <p className="text-sm opacity-70 mb-3">{hint}</p>
                    <table className="text-sm">
                      <thead>
                        <tr><th />{cols.map((c) => <th key={c} className="px-3 py-1" title={swot[c]}>{c}</th>)}</tr>
                      </thead>
                      <tbody>
                        {rows.map((r) => (
                          <tr key={r}>
                            <th className="px-2 text-right" title={swot[r]}>{r}</th>
                            {cols.map((c) => (
                              <td key={c} className="px-1 py-1">
                                <select value={grids[rel][`${r}-${c}`] ?? 0}
                                  onChange={(e) => setGrids((g) => ({
                                    ...g, [rel]: { ...g[rel], [`${r}-${c}`]: parseInt(e.target.value) },
                                  }))}
                                  className="rounded border px-2 py-1">
                                  {[0, 1, 2, 3, 4].map((v) => <option key={v}>{v}</option>)}
                                </select>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <p className="mt-2 text-sm">Total {rel}: <b>{totals[rel]}</b></p>
                  </div>
                ))}
                <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-green-900">
                  {(() => { const s = recommendedStrategy(totals);
                    return (<><p className="font-semibold">Estrategia recomendada: {s.name} ({s.relation}, {s.score} pts)</p>
                      <p>{s.description}</p></>);
                  })()}
                </div>
                <button onClick={save} className="rounded-lg bg-[#1F2465] text-white px-5 py-2 hover:bg-[#3a4487]">
                  {saving ? "Guardando…" : "Guardar"}
                </button>
              </div>
            )}

            {step.kind === "came" && (
              <div className="space-y-4">
                {([["C", "Corregir las debilidades"], ["A", "Afrontar las amenazas"],
                   ["M", "Mantener las fortalezas"], ["E", "Explotar las oportunidades"]] as const
                ).map(([letter, label]) => (
                  <div key={letter} className="rounded-lg border p-4">
                    <p className="font-semibold mb-2">{letter} — {label}</p>
                    {[1, 2, 3, 4].map((p) => (
                      <input key={p} value={came[`${letter}${p}`] ?? ""} placeholder={`Acción ${p}`}
                        onChange={(e) => setCame((c) => ({ ...c, [`${letter}${p}`]: e.target.value }))}
                        onBlur={save} className="w-full rounded border px-3 py-2 mb-2" />
                    ))}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Navegación */}
        <div className="flex justify-between border-t pt-4">
          {stepN > 1 ? (
            <Link href={`/plan/${planId}/paso/${stepN - 1}`} className="opacity-70 hover:opacity-100">← Anterior</Link>
          ) : <span />}
          {stepN < 10 ? (
            <Link href={`/plan/${planId}/paso/${stepN + 1}`} className="font-medium text-[#1F2465] dark:text-[#8f9bd8]">Siguiente →</Link>
          ) : (
            <Link href={`/plan/${planId}/resumen`} className="font-medium text-green-600">Ver resumen ejecutivo →</Link>
          )}
        </div>
      </main>
    </div>
  );
}

function SwotInputs({ keys, swot, setSwot, onBlur }: {
  keys: string[];
  swot: Record<string, string>;
  setSwot: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onBlur: () => void;
}) {
  if (!keys.length) return null;
  const labels: Record<string, string> = { F: "Fortalezas", D: "Debilidades", O: "Oportunidades", A: "Amenazas" };
  const groups = Array.from(new Set(keys.map((k) => k[0])));
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {groups.map((g) => (
        <div key={g} className="rounded-lg border p-4">
          <p className="font-semibold mb-2">{labels[g]}</p>
          {keys.filter((k) => k[0] === g).map((k) => (
            <input key={k} value={swot[k] ?? ""} placeholder={k}
              onChange={(e) => setSwot((s) => ({ ...s, [k]: e.target.value }))}
              onBlur={onBlur} className="w-full rounded border px-3 py-2 mb-2" />
          ))}
        </div>
      ))}
    </div>
  );
}
