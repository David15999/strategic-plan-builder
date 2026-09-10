"use client";

// Descargar el plan es el paso final del trabajo práctico, así que no puede
// depender de que el estudiante conozca Ctrl+P (menos todavía en el celular).
export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-lg bg-[#1F2465] text-white px-4 py-2 text-sm font-medium hover:bg-[#3a4487]"
    >
      🖨 Imprimir o guardar en PDF
    </button>
  );
}
