# Strategic Plan Builder

Aplicación web educativa que digitaliza la **Metodología de un Plan Estratégico** (originalmente un libro de Excel) como proyecto de ejemplo para estudiantes de FCE UNAM.

Guía al estudiante por 10 pasos: Misión → Visión → Valores → Objetivos (METAS/UEN) → Análisis interno y externo → Cadena de Valor (autodiagnóstico de 25 preguntas) → 5 Fuerzas de Porter → Análisis PEST → Matriz Cruzada FODA (estrategia recomendada) → Matriz CAME. Al final genera un **Resumen Ejecutivo** imprimible.

## Stack

- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS — deploy en **Vercel** (plan Hobby, gratis)
- **Backend**: **Supabase** free tier — Postgres, Auth por magic link, Row Level Security
- Sin servidores propios: el cliente habla directo con Supabase protegido por RLS.

## Setup (paso a paso para estudiantes)

1. **Forkeá este repo** en tu cuenta de GitHub.
2. **Creá un proyecto gratis en [supabase.com](https://supabase.com)**.
3. En el editor SQL de Supabase, pegá y ejecutá `supabase/migrations/0001_init.sql`.
4. En *Authentication → URL Configuration*, agregá tu dominio de Vercel a Redirect URLs (`https://TU-APP.vercel.app/**`).
5. **Creá un proyecto en [vercel.com](https://vercel.com)** importando tu fork y agregá las variables de entorno (ver `.env.example`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Deploy. Cada push a `main` redeploya automáticamente.

### Desarrollo local

```bash
cp .env.example .env.local   # completá con tus claves de Supabase
npm install
npm run dev
```

## Estructura

```
app/                     # rutas: landing, login, dashboard, plan/[id]/paso/[n], resumen
lib/content/contenido.json  # preguntas y textos didácticos extraídos del Excel original
lib/scoring.ts           # fórmulas del Excel portadas (potencial de mejora, Porter, matriz cruzada)
lib/steps.ts             # definición de los 10 pasos del wizard
supabase/migrations/     # schema + políticas RLS
```

## Notas

- El free tier de Supabase **pausa el proyecto tras ~7 días de inactividad**; se reactiva desde el dashboard con un clic.
- Contenido didáctico basado en la metodología clásica de planificación estratégica (FODA, Porter, PEST, CAME). Uso educativo.

## Licencia

MIT
