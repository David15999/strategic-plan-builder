# Strategic Plan Builder

Aplicación web educativa que digitaliza la **Metodología de un Plan Estratégico** (originalmente un libro de Excel) como proyecto de ejemplo para estudiantes de FCE UNAM.

Guía al estudiante por 10 pasos: Misión → Visión → Valores → Objetivos (METAS/UEN) → Análisis interno y externo → Cadena de Valor (autodiagnóstico de 25 preguntas) → 5 Fuerzas de Porter → Análisis PEST → Matriz Cruzada FODA (estrategia recomendada) → Matriz CAME. Al final genera un **Resumen Ejecutivo** imprimible.

## Stack

- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS — deploy en **Vercel** (plan Hobby, gratis)
- **Backend**: **Supabase** free tier — Postgres, Auth por usuario y contraseña, Row Level Security
- Sin servidores propios: el cliente habla directo con Supabase protegido por RLS.

## Setup (paso a paso para estudiantes)

1. **Forkeá este repo** en tu cuenta de GitHub.
2. **Creá un proyecto gratis en [supabase.com](https://supabase.com)**.
3. En el editor SQL de Supabase, pegá y ejecutá `supabase/migrations/0001_init.sql`.
4. En *Authentication → Sign In / Up → Email*, **desactivá «Confirm email»**: los estudiantes se registran con usuario y contraseña, sin que se envíe ningún correo.
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
components/Tour.tsx      # tour guiado (driver.js) para quien entra por primera vez
lib/content/contenido.json  # preguntas y textos didácticos extraídos del Excel original
lib/scoring.ts           # fórmulas del Excel portadas (potencial de mejora, Porter, matriz cruzada)
lib/steps.ts             # definición de los 10 pasos del wizard
lib/tour.ts              # textos del tour guiado (editables sin tocar componentes)
supabase/migrations/     # schema + políticas RLS
vercel.json              # cron diario que evita la auto-pausa de Supabase
```

## Cuentas de estudiantes

Cada estudiante se registra con un **nombre de usuario y una contraseña** (hay un generador de contraseñas seguras en el formulario). No se pide ni se envía correo electrónico. Internamente el usuario se mapea a un email sintético `usuario@alumnos.spb.local`, porque Supabase Auth trabaja con emails.

Si alguien olvida su contraseña, se la reseteás desde *Authentication → Users* en el dashboard de Supabase.

## Tour guiado

Quien entra por primera vez ve un tour que resalta las partes de la pantalla: uno en el listado de planes y otro en el asistente de 10 pasos. El botón **?** del encabezado lo vuelve a mostrar cuando quieran.

Los textos están en `lib/tour.ts`, separados del código, para que la cátedra pueda editarlos. El estado de "ya lo vio" se guarda **en la cuenta del estudiante** y no en el navegador, porque en los laboratorios varias personas comparten el mismo perfil de Chrome.

## Notas

- El free tier de Supabase **pausa el proyecto tras ~7 días de inactividad**. El cron diario de `vercel.json` lo mantiene despierto; si aun así se pausa, se reactiva desde el dashboard con un clic ("Restore project").
- El middleware tolera que Supabase no responda: en vez de dejar la app caída, deja pasar la navegación y la pantalla muestra un error claro.
- Contenido didáctico basado en la metodología clásica de planificación estratégica (FODA, Porter, PEST, CAME). Uso educativo.

## Licencia

MIT
