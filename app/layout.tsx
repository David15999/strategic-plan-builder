import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Plan Estratégico — FCE UNaM · Cátedra de Administración",
  description:
    "Metodología de un Plan Estratégico paso a paso — Facultad de Ciencias Económicas, Universidad Nacional de Misiones",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="bg-[#1F2465] text-white print:hidden">
          <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo_fce-imagotipo_negativo.png"
                alt="Facultad de Ciencias Económicas — UNaM"
                className="h-10 w-auto"
              />
              <p className="text-xs text-white/70 border-l border-white/25 pl-3 leading-tight">
                Universidad Nacional
                <br />
                de Misiones
              </p>
            </div>
            <p className="text-sm text-white/80 text-right hidden sm:block">
              Cátedra de Administración
            </p>
          </div>
        </header>
        <div className="flex-1 flex flex-col">{children}</div>
        <footer className="border-t print:hidden">
          <div className="max-w-5xl mx-auto px-6 py-4 text-xs opacity-60 flex flex-wrap justify-between gap-2">
            <span>
              Cátedra de Administración · FCE — Universidad Nacional de Misiones
            </span>
            <span>Metodología de un Plan Estratégico</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
