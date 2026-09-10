// Contenido de los tours guiados. Está separado de la UI a propósito:
// la cátedra puede reescribir los textos sin tocar el código de los componentes.
//
// `element` es el selector del elemento a resaltar. Un paso sin `element`
// se muestra centrado en la pantalla (útil para introducir o cerrar).
// Los pasos cuyo elemento no esté visible se omiten solos (por ejemplo, la
// barra lateral en celular), así que es seguro apuntar a cosas condicionales.

export type TourId = "dashboard" | "wizard";

export type TourStep = {
  element?: string;
  title: string;
  description: string;
  side?: "top" | "bottom" | "left" | "right";
};

export const TOURS: Record<TourId, TourStep[]> = {
  dashboard: [
    {
      title: "Te damos la bienvenida 👋",
      description:
        "Acá vas a elaborar el plan estratégico de una empresa en 10 pasos, siguiendo la metodología de la cátedra. Todo se guarda en tu cuenta: podés cerrar sesión y retomar cuando quieras, desde cualquier computadora.",
    },
    {
      element: '[data-tour="new-plan"]',
      title: "1. Creá tu plan",
      description:
        "Escribí el nombre de la empresa o proyecto sobre el que vas a trabajar y presioná «Nuevo plan». Podés tener varios planes al mismo tiempo.",
      side: "bottom",
    },
    {
      element: '[data-tour="plan-card"]',
      title: "2. Tus planes guardados",
      description:
        "Cada plan que crees aparece en esta lista, con la fecha de la última vez que lo editaste.",
      side: "bottom",
    },
    {
      element: '[data-tour="plan-actions"]',
      title: "3. Administralos",
      description:
        "«Abrir» te lleva a seguir trabajando y «Resumen» muestra el documento final. También podés cambiarle el nombre a un plan o borrarlo si te equivocaste.",
      side: "top",
    },
    {
      element: '[data-tour="help"]',
      title: "¿Perdiste el hilo?",
      description:
        "Podés volver a ver esta guía cuando quieras tocando el signo de pregunta. ¡A trabajar!",
      side: "bottom",
    },
  ],

  wizard: [
    {
      title: "Cómo se organiza el plan",
      description:
        "La metodología responde tres preguntas, en orden: <b>dónde querés estar</b> (pasos 1 a 4), <b>dónde estás hoy</b> (pasos 5 a 8) y <b>cómo llegar</b> (pasos 9 y 10). Al final obtenés un resumen ejecutivo con todo integrado.",
    },
    {
      element: '[data-tour="stepper"]',
      title: "Los 10 pasos",
      description:
        "Esta barra es tu mapa: te muestra en qué paso estás y te deja moverte libremente entre ellos. No hace falta completarlos en orden estricto.",
      side: "right",
    },
    {
      element: '[data-tour="save-status"]',
      title: "Se guarda solo",
      description:
        "No busques un botón de «guardar»: tu trabajo se graba automáticamente al salir de cada campo. Acá vas a ver el aviso de «Guardado» cada vez que ocurre.",
      side: "left",
    },
    {
      element: '[data-tour="step-content"]',
      title: "Tu espacio de trabajo",
      description:
        "En cada paso vas a encontrar primero la explicación del concepto y debajo los campos para completar. En los pasos 6, 7 y 8 son cuestionarios con escala, y el sistema calcula el resultado por vos.",
      side: "top",
    },
    {
      element: '[data-tour="resumen"]',
      title: "El documento final",
      description:
        "Cuando termines, acá tenés el resumen ejecutivo con todo tu plan integrado, listo para imprimir o guardar como PDF y entregar.",
      side: "right",
    },
  ],
};

// Paso extra que se inserta solo en los pasos 6, 7 y 8 del asistente, donde
// aparecen los campos del FODA. Explica la mejora principal sobre el Excel.
export const SWOT_STEP: TourStep = {
  element: '[data-tour="swot"]',
  title: "El FODA se completa solo",
  description:
    "Las fortalezas, debilidades, oportunidades y amenazas que anotes en estos autodiagnósticos pasan automáticamente a la matriz cruzada del paso 9 y al resumen final. No tenés que copiarlas a mano.",
  side: "top",
};
