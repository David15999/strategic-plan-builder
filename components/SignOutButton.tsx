"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

// El cierre de sesión se hace desde el cliente a propósito: es el cliente del
// navegador el que administra las cookies de sesión de Supabase. Hacerlo sólo
// en el servidor dejaba la sesión viva, y en una sala de computadoras eso
// significa que el próximo estudiante entra a la cuenta del anterior.
export default function SignOutButton() {
  const [busy, setBusy] = useState(false);

  async function signOut() {
    setBusy(true);
    const supabase = createClient();
    await supabase.auth.signOut({ scope: "local" });
    // Recarga completa para descartar cualquier dato del usuario anterior
    // que hubiera quedado en memoria.
    window.location.replace("/login");
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={busy}
      className="rounded border px-3 py-1 opacity-70 hover:opacity-100 disabled:opacity-40"
    >
      {busy ? "Saliendo…" : "Salir"}
    </button>
  );
}
