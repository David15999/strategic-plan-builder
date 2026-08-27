-- Strategic Plan Builder — schema inicial
-- Un plan estratégico por empresa/proyecto, con las 10 fases de la metodología.

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Mi plan estratégico',
  authors text,
  elaboration_date date default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Texto libre por sección: mision, vision, valores, uen, estrategia
create table public.plan_sections (
  plan_id uuid not null references public.plans(id) on delete cascade,
  section text not null check (section in ('mision','vision','valores','uen','estrategia')),
  content text not null default '',
  primary key (plan_id, section)
);

-- Objetivos estratégicos (generales) con sus específicos
create table public.objectives (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.plans(id) on delete cascade,
  position int not null default 1,
  general text not null default '',
  specific text not null default '',
  unique (plan_id, position)
);

-- Autodiagnósticos: cadena_valor (25 preguntas 0-4), pest (25 preguntas 0-4),
-- porter (17 filas 1-5). answers = { "0": 3, "1": 2, ... } por índice de pregunta.
create table public.assessments (
  plan_id uuid not null references public.plans(id) on delete cascade,
  type text not null check (type in ('cadena_valor','porter','pest')),
  answers jsonb not null default '{}'::jsonb,
  primary key (plan_id, type)
);

-- Ítems FODA: F1-F4 y D1-D4 (de cadena de valor), O1-O2/A1-A2 (Porter), O3-O4/A3-A4 (PEST)
create table public.swot_items (
  plan_id uuid not null references public.plans(id) on delete cascade,
  kind text not null check (kind in ('F','D','O','A')),
  position int not null check (position between 1 and 4),
  text text not null default '',
  primary key (plan_id, kind, position)
);

-- Matriz cruzada: 4 cruces (FO, FA, DO, DA), cada uno una grilla 4x4 con valores 0-4
create table public.cross_matrix (
  plan_id uuid not null references public.plans(id) on delete cascade,
  relation text not null check (relation in ('FO','FA','DO','DA')),
  grid jsonb not null default '{}'::jsonb, -- { "1-1": 3, "1-2": 0, ... } fila-columna
  primary key (plan_id, relation)
);

-- Matriz CAME: 16 acciones, 4 por letra
create table public.came_actions (
  plan_id uuid not null references public.plans(id) on delete cascade,
  letter text not null check (letter in ('C','A','M','E')),
  position int not null check (position between 1 and 4),
  text text not null default '',
  primary key (plan_id, letter, position)
);

-- updated_at automático en plans
create or replace function public.touch_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger plans_touch before update on public.plans
  for each row execute function public.touch_updated_at();

-- RLS: cada estudiante solo ve sus planes
alter table public.plans enable row level security;
alter table public.plan_sections enable row level security;
alter table public.objectives enable row level security;
alter table public.assessments enable row level security;
alter table public.swot_items enable row level security;
alter table public.cross_matrix enable row level security;
alter table public.came_actions enable row level security;

create policy "own plans" on public.plans
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own plan_sections" on public.plan_sections for all
  using (exists (select 1 from public.plans p where p.id = plan_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.plans p where p.id = plan_id and p.user_id = auth.uid()));

create policy "own objectives" on public.objectives for all
  using (exists (select 1 from public.plans p where p.id = plan_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.plans p where p.id = plan_id and p.user_id = auth.uid()));

create policy "own assessments" on public.assessments for all
  using (exists (select 1 from public.plans p where p.id = plan_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.plans p where p.id = plan_id and p.user_id = auth.uid()));

create policy "own swot_items" on public.swot_items for all
  using (exists (select 1 from public.plans p where p.id = plan_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.plans p where p.id = plan_id and p.user_id = auth.uid()));

create policy "own cross_matrix" on public.cross_matrix for all
  using (exists (select 1 from public.plans p where p.id = plan_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.plans p where p.id = plan_id and p.user_id = auth.uid()));

create policy "own came_actions" on public.came_actions for all
  using (exists (select 1 from public.plans p where p.id = plan_id and p.user_id = auth.uid()))
  with check (exists (select 1 from public.plans p where p.id = plan_id and p.user_id = auth.uid()));
