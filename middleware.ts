import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Si Supabase no responde (proyecto pausado en el free tier, corte de red),
// no bloqueamos la navegación: dejamos pasar y que la página maneje la sesión.
// Sin esto, el middleware agota su tiempo y Vercel devuelve 504 en toda la app.
const AUTH_TIMEOUT_MS = 3000;

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  let user = null;
  let authReachable = true;
  try {
    const result = await Promise.race([
      supabase.auth.getUser(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("auth timeout")), AUTH_TIMEOUT_MS)
      ),
    ]);
    user = result.data.user;
  } catch {
    authReachable = false;
  }

  const path = request.nextUrl.pathname;
  const isProtected = path.startsWith("/dashboard") || path.startsWith("/plan");
  if (authReachable && !user && isProtected) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return response;
}

export const config = {
  // /login queda fuera a propósito: es público y no necesita comprobar sesión,
  // así carga sin depender de Supabase.
  matcher: ["/dashboard/:path*", "/plan/:path*"],
};
