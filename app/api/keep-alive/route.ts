import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// El free tier de Supabase pausa el proyecto tras ~7 días sin actividad.
// Un cron diario (ver vercel.json) toca la base para que eso no ocurra
// durante el cursado.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { error } = await supabase
      .from("plans")
      .select("id", { count: "exact", head: true });

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 502 }
      );
    }
    return NextResponse.json({ ok: true, at: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "unknown" },
      { status: 502 }
    );
  }
}
