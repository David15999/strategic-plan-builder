"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { driver, type Driver } from "driver.js";
import "driver.js/dist/driver.css";
import { createClient } from "@/lib/supabase/client";
import { SWOT_STEP, TOURS, type TourId, type TourStep } from "@/lib/tour";

// Evento para relanzar el tour desde el botón de ayuda, sin pasar props
// por toda la jerarquía de componentes.
export const START_TOUR_EVENT = "spb:start-tour";

export function startTour(tourId: TourId) {
  window.dispatchEvent(new CustomEvent(START_TOUR_EVENT, { detail: tourId }));
}

/** Un elemento cuenta como visible si existe y no está oculto por CSS. */
function isVisible(selector: string): boolean {
  const el = document.querySelector<HTMLElement>(selector);
  return !!el && el.offsetParent !== null;
}

export default function Tour({
  tourId,
  extraSteps = [],
  /** Cuando es false, el tour espera (por ejemplo, mientras el paso carga). */
  ready = true,
}: {
  tourId: TourId;
  extraSteps?: { after: number; step: TourStep }[];
  ready?: boolean;
}) {
  const driverRef = useRef<Driver | null>(null);
  const autoStarted = useRef(false);
  const supabase = useMemo(() => createClient(), []);
  const metadataKey = `tour_${tourId}_done`;

  // Guardamos los pasos extra en una ref: quien nos usa suele pasar un array
  // literal, que sería nuevo en cada render y reiniciaría los efectos.
  const extraStepsRef = useRef(extraSteps);
  extraStepsRef.current = extraSteps;

  const buildSteps = useCallback((): TourStep[] => {
    const steps = [...TOURS[tourId]];
    // Insertamos de atrás hacia adelante para que los índices no se corran.
    [...extraStepsRef.current]
      .sort((a, b) => b.after - a.after)
      .forEach(({ after, step }) => steps.splice(after, 0, step));
    // Un paso sin `element` es centrado y siempre se muestra.
    return steps.filter((s) => !s.element || isVisible(s.element));
  }, [tourId]);

  const run = useCallback(
    (markAsSeen: boolean) => {
      const steps = buildSteps();
      if (!steps.length) return;

      driverRef.current?.destroy();
      const d = driver({
        showProgress: steps.length > 1,
        progressText: "{{current}} de {{total}}",
        nextBtnText: "Siguiente",
        prevBtnText: "Anterior",
        doneBtnText: "Entendido",
        popoverClass: "spb-tour",
        allowClose: true,
        steps: steps.map((s) => ({
          element: s.element,
          popover: {
            title: s.title,
            description: s.description,
            side: s.side,
            align: "start",
          },
        })),
        onDestroyed: () => {
          if (markAsSeen) {
            // Si falla (sin conexión) no rompemos nada: el tour se mostrará
            // de nuevo la próxima vez, que es el comportamiento aceptable.
            supabase.auth
              .updateUser({ data: { [metadataKey]: true } })
              .catch(() => {});
          }
        },
      });
      driverRef.current = d;
      d.drive();
    },
    [buildSteps, supabase, metadataKey]
  );

  // Arranque automático la primera vez que el estudiante ve esta pantalla.
  // El "ya lo vio" se guarda en la cuenta y no en el navegador, porque en los
  // laboratorios varios estudiantes comparten el mismo perfil de Chrome.
  useEffect(() => {
    if (!ready || autoStarted.current) return;
    let cancelled = false;

    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled || !user || user.user_metadata?.[metadataKey]) return;
      autoStarted.current = true;
      // Un respiro para que termine de pintarse el layout antes de medir.
      setTimeout(() => !cancelled && run(true), 400);
    })();

    return () => {
      cancelled = true;
    };
  }, [ready, run, supabase, metadataKey]);

  // Relanzado manual desde el botón de ayuda.
  useEffect(() => {
    const onStart = (e: Event) => {
      if ((e as CustomEvent<TourId>).detail === tourId) run(false);
    };
    window.addEventListener(START_TOUR_EVENT, onStart);
    return () => window.removeEventListener(START_TOUR_EVENT, onStart);
  }, [tourId, run]);

  useEffect(() => () => driverRef.current?.destroy(), []);

  return null;
}

export function HelpButton({ tourId }: { tourId: TourId }) {
  return (
    <button
      type="button"
      data-tour="help"
      onClick={() => startTour(tourId)}
      title="Ver la guía de uso"
      aria-label="Ver la guía de uso"
      className="h-7 w-7 shrink-0 rounded-full border border-current/30 text-sm font-semibold opacity-70 hover:opacity-100"
    >
      ?
    </button>
  );
}
