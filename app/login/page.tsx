"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Los estudiantes usan un nombre de usuario; internamente se mapea a un
// email sintético porque Supabase Auth trabaja con emails.
const USER_DOMAIN = "alumnos.spb.local";
const toEmail = (u: string) => `${u.toLowerCase()}@${USER_DOMAIN}`;
const USERNAME_RE = /^[a-zA-Z0-9._-]{3,30}$/;

function generatePassword(): string {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!#$%&*";
  const arr = new Uint32Array(12);
  crypto.getRandomValues(arr);
  return Array.from(arr, (n) => chars[n % chars.length]).join("");
}

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!USERNAME_RE.test(username)) {
      setError("El usuario debe tener 3-30 caracteres (letras, números, . _ -), sin espacios.");
      return;
    }
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    setBusy(true);
    const supabase = createClient();
    const email = toEmail(username);
    const { error } =
      mode === "signup"
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      const msg = error.message.includes("Invalid login credentials")
        ? "Usuario o contraseña incorrectos."
        : error.message.includes("already registered")
          ? "Ese nombre de usuario ya existe. Elegí otro o ingresá con tu contraseña."
          : error.message;
      setError(msg);
    } else {
      window.location.href = "/dashboard";
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold">
          {mode === "login" ? "Ingresar" : "Crear cuenta"}
        </h1>

        <div className="flex rounded-lg border overflow-hidden text-sm">
          <button
            onClick={() => { setMode("login"); setError(null); }}
            className={`flex-1 py-2 ${mode === "login" ? "bg-blue-600 text-white" : ""}`}
          >
            Ya tengo cuenta
          </button>
          <button
            onClick={() => { setMode("signup"); setError(null); }}
            className={`flex-1 py-2 ${mode === "signup" ? "bg-blue-600 text-white" : ""}`}
          >
            Soy nuevo
          </button>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <input
            required
            placeholder="Nombre de usuario (ej: jperez)"
            value={username}
            autoCapitalize="none"
            onChange={(e) => setUsername(e.target.value.trim())}
            className="w-full rounded-lg border px-4 py-2"
          />
          <div className="flex gap-2">
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex-1 rounded-lg border px-4 py-2"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="rounded-lg border px-3 text-sm"
              title={showPassword ? "Ocultar" : "Mostrar"}
            >
              {showPassword ? "🙈" : "👁"}
            </button>
          </div>

          {mode === "signup" && (
            <button
              type="button"
              onClick={() => { setPassword(generatePassword()); setShowPassword(true); }}
              className="w-full rounded-lg border border-dashed py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-900"
            >
              🎲 Generar contraseña segura
            </button>
          )}

          <button
            disabled={busy}
            className="w-full rounded-lg bg-blue-600 text-white py-2 font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {busy ? "Un momento…" : mode === "login" ? "Ingresar" : "Crear cuenta y entrar"}
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>

        {mode === "signup" ? (
          <p className="text-xs opacity-60">
            Anotá tu usuario y contraseña: los vas a necesitar para volver a
            entrar y ver tus planes guardados. No se envía ningún email.
          </p>
        ) : (
          <p className="text-xs opacity-60">
            ¿Olvidaste tu contraseña? Escribí a{" "}
            <a href="mailto:david.moreira@fce.unam.edu.ar" className="underline">
              david.moreira@fce.unam.edu.ar
            </a>{" "}
            indicando tu nombre de usuario.
          </p>
        )}
      </div>
    </main>
  );
}
