"use client";

// Borrar un plan elimina en cascada todo lo que el estudiante cargó y no hay
// forma de recuperarlo, así que pedimos confirmación con el nombre a la vista.
export default function DeletePlanButton({ planName }: { planName: string }) {
  return (
    <button
      onClick={(e) => {
        const ok = window.confirm(
          `¿Seguro que querés borrar «${planName}»?\n\nSe va a eliminar todo el trabajo cargado en ese plan y no se puede deshacer.`
        );
        if (!ok) e.preventDefault();
      }}
      className="rounded border border-red-300 text-red-600 px-3 py-1 hover:bg-red-50"
    >
      🗑 Borrar
    </button>
  );
}
