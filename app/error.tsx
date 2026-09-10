"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-2xl font-bold">No pudimos cargar tus datos</h1>
        <p className="opacity-80">
          Puede ser un problema momentáneo de conexión con el servidor. Probá de
          nuevo en unos segundos; tus planes guardados no se pierden.
        </p>
        <button
          onClick={reset}
          className="rounded-lg bg-[#1F2465] text-white px-5 py-2 font-medium hover:bg-[#3a4487]"
        >
          Reintentar
        </button>
        <p className="text-xs opacity-60">
          Si el problema sigue, escribí a{" "}
          <a href="mailto:david.moreira@fce.unam.edu.ar" className="underline">
            david.moreira@fce.unam.edu.ar
          </a>
        </p>
      </div>
    </main>
  );
}
