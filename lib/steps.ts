export const STEPS = [
  { n: 1, slug: "mision", title: "Misión", kind: "text" },
  { n: 2, slug: "vision", title: "Visión", kind: "text" },
  { n: 3, slug: "valores", title: "Valores", kind: "text" },
  { n: 4, slug: "objetivos", title: "Objetivos estratégicos y UEN", kind: "objectives" },
  { n: 5, slug: "foda-intro", title: "Análisis interno y externo", kind: "info" },
  { n: 6, slug: "cadena-valor", title: "Cadena de valor", kind: "assessment" },
  { n: 7, slug: "porter", title: "5 Fuerzas de Porter", kind: "porter" },
  { n: 8, slug: "pest", title: "Análisis PEST", kind: "assessment" },
  { n: 9, slug: "matriz-cruzada", title: "Identificación de estrategias", kind: "matrix" },
  { n: 10, slug: "came", title: "Matriz CAME", kind: "came" },
] as const;

export const INTRO: Record<string, string> = {
  mision:
    "La MISIÓN es la razón de ser de la empresa/organización. Describe la actividad y razón de ser de la organización. Describa la Misión de su empresa.",
  vision:
    "La VISIÓN define lo que la empresa/organización quiere lograr en el futuro. Debe ser conocida y compartida por todos los miembros. Describa la Visión de su empresa.",
  valores:
    "Los VALORES son el conjunto de principios, reglas y aspectos culturales con los que se rige la organización. Ejemplos: integridad, ética profesional, responsabilidad social, innovación. Exponga los Valores de su empresa.",
  objetivos:
    "Un OBJETIVO ESTRATÉGICO es un fin deseado, clave para la organización. Todo objetivo debe ser METAS: Medible, Específico, Trazable, Alcanzable y Sensato. Defina hasta 3 objetivos generales con sus objetivos específicos, y comente las UEN si corresponde.",
  "foda-intro":
    "Para determinar la estrategia se realiza un doble análisis: interno (fortalezas y debilidades) y externo (oportunidades y amenazas). En los próximos 3 pasos completará autodiagnósticos que alimentan automáticamente su matriz FODA.",
  "cadena-valor":
    "La Cadena de Valor identifica las actividades que generan ventaja competitiva. Valore cada afirmación de 0 (en total desacuerdo) a 4 (en total acuerdo). Luego registre las Fortalezas (F1-F4) y Debilidades (D1-D4) que detecte.",
  porter:
    "El Modelo de las 5 Fuerzas de Porter estudia el microentorno del negocio. Para cada factor, marque dónde se ubica su sector entre el extremo hostil y el favorable. Luego registre Oportunidades (O1-O2) y Amenazas (A1-A2).",
  pest:
    "El análisis PEST estudia el macroentorno: factores Políticos, Económicos, Sociales y Tecnológicos (y medioambientales). Valore cada afirmación de 0 a 4. Luego registre Oportunidades (O3-O4) y Amenazas (A3-A4).",
  "matriz-cruzada":
    "La Matriz Cruzada relaciona su FODA: puntúe de 0 a 4 cuánto se relaciona cada fortaleza/debilidad con cada oportunidad/amenaza. La puntuación mayor indica la estrategia a llevar a cabo.",
  came:
    "Para finalizar, defina acciones concretas: Corregir las debilidades, Afrontar las amenazas, Mantener las fortalezas y Explotar las oportunidades. Estas acciones deben responder a la estrategia identificada.",
};
