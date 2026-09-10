// Fórmulas portadas del Excel "METODOLOGÍA DE UN PLAN ESTRATÉGICO"
import contenido from "@/lib/content/contenido.json";

export type Answers = Record<string, number>;

// --- Cadena de valor y PEST: 25 preguntas, escala 0-4 ---
// Potencial de mejora = 1 - (puntaje obtenido / puntaje máximo posible).
// El máximo se calcula sobre las preguntas efectivamente respondidas, para no
// castigar a quien todavía va por la mitad del cuestionario.
//
// "Respondida" es tener una opción marcada, incluido el 0 ("en total
// desacuerdo"): antes se contaban sólo los valores mayores que cero, así que
// marcar 0 quedaba como no contestar y el porcentaje salía inflado.
export function potencialMejora(answers: Answers, total = 25): number {
  const answered = Array.from({ length: total }, (_, i) => answers[String(i)]).filter(
    (v): v is number => typeof v === "number"
  );
  if (!answered.length) return 1;
  const score = answered.reduce((a, b) => a + b, 0);
  return 1 - score / (answered.length * 4);
}

export function sumaTotal(answers: Answers): number {
  return Object.values(answers).reduce((a, b) => a + (b || 0), 0);
}

// --- Porter: 17 filas, escala 1 (hostil) a 5 (favorable) → total y conclusión ---
export function porterTotal(answers: Answers): number {
  return contenido.porter.reduce(
    (acc, _f, i) => acc + (answers[String(i)] ?? 0),
    0
  );
}

export function porterConclusion(total: number): string {
  // Rangos según la hoja AutoPorter (máx 17*5 = 85)
  if (total <= 34)
    return "Estamos en un mercado altamente competitivo, en el que es muy difícil hacerse un lugar.";
  if (total <= 50)
    return "Estamos en un mercado de competitividad relativamente alta, pero con ciertas posibilidades.";
  if (total <= 67)
    return "La situación actual del mercado es favorable a la empresa.";
  return "Estamos en una situación excelente para la empresa.";
}

// --- Matriz cruzada: suma de cada grilla 4x4 → estrategia recomendada ---
export type Relation = "FO" | "FA" | "DO" | "DA";

export const STRATEGIES: Record<Relation, { name: string; description: string }> = {
  FO: { name: "Estrategia Ofensiva", description: "Deberá adoptar estrategias de crecimiento." },
  FA: { name: "Estrategia Defensiva", description: "La empresa está preparada para enfrentarse a las amenazas." },
  DA: { name: "Estrategia de Supervivencia", description: "Se enfrenta a amenazas externas sin las fortalezas internas necesarias para luchar contra la competencia." },
  DO: { name: "Estrategia de Reorientación", description: "La empresa no puede aprovechar las oportunidades porque carece de la preparación adecuada. Debe establecer un programa de acciones específicas y reorientar sus estrategias anteriores." },
};

export function gridTotal(grid: Record<string, number>): number {
  return Object.values(grid).reduce((a, b) => a + (b || 0), 0);
}

/**
 * Devuelve la estrategia con mayor puntaje, o null si la matriz todavía está
 * vacía: sin puntuar, todos los totales valen 0 y cualquier "ganadora" sería
 * un resultado inventado en el trabajo del estudiante.
 */
export function recommendedStrategy(
  totals: Record<Relation, number>
): { relation: Relation; name: string; description: string; score: number } | null {
  const relations = Object.keys(totals) as Relation[];
  if (relations.every((r) => !totals[r])) return null;

  const winner = relations.reduce((a, b) => (totals[b] > totals[a] ? b : a));
  return { relation: winner, ...STRATEGIES[winner], score: totals[winner] };
}
