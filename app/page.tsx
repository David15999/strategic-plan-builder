import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-4xl font-bold max-w-2xl">
        Metodología de un Plan Estratégico
      </h1>
      <p className="max-w-xl text-lg opacity-80">
        Aplicación educativa para elaborar el plan estratégico de una empresa
        paso a paso: misión, visión, valores, objetivos, FODA, cadena de valor,
        5 fuerzas de Porter, PEST, matriz cruzada y matriz CAME.
      </p>
      <Link
        href="/login"
        className="rounded-lg bg-[#1F2465] text-white px-6 py-3 font-medium hover:bg-[#3a4487]"
      >
        Comenzar
      </Link>
      <p className="text-sm opacity-60">
        Cátedra de Administración · Facultad de Ciencias Económicas — UNaM
      </p>
    </main>
  );
}
