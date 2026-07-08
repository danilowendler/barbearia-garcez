-- Barbearia Garcez — schema inicial
-- Rodar no SQL Editor do Supabase (ou via CLI) antes do 0002_seed.sql.

-- Necessária para a constraint de exclusão com uuid + tstzrange
create extension if not exists btree_gist with schema extensions;

create type public.appointment_status as enum (
  'pending',
  'confirmed',
  'cancelled',
  'completed'
);

-- ── Tabelas ────────────────────────────────────────────────────────────────

create table public.barbers (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  photo_url text,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{1,40}$'),
  name text not null check (char_length(name) between 1 and 80),
  short_name text not null check (char_length(short_name) between 1 and 24),
  description text check (char_length(description) <= 300),
  price_cents integer not null check (price_cents >= 0),
  duration_min integer not null check (duration_min between 5 and 480),
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.working_hours (
  id bigint generated always as identity primary key,
  barber_id uuid not null references public.barbers (id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6), -- 0 = domingo
  start_time time not null,
  end_time time not null,
  check (start_time < end_time)
);

create table public.time_blocks (
  id uuid primary key default gen_random_uuid(),
  -- null = bloqueio da loja inteira (feriado etc.)
  barber_id uuid references public.barbers (id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text check (char_length(reason) <= 200),
  created_at timestamptz not null default now(),
  check (starts_at < ends_at)
);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  barber_id uuid not null references public.barbers (id),
  service_id uuid not null references public.services (id),
  customer_name text not null check (char_length(customer_name) between 2 and 120),
  customer_phone text not null check (customer_phone ~ '^[0-9]{10,13}$'),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status public.appointment_status not null default 'pending',
  created_at timestamptz not null default now(),
  check (starts_at < ends_at)
);

-- Garantia definitiva contra double-booking: dois agendamentos não
-- cancelados do mesmo barbeiro nunca se sobrepõem no tempo.
alter table public.appointments
  add constraint appointments_no_overlap
  exclude using gist (
    barber_id with =,
    tstzrange(starts_at, ends_at) with &&
  )
  where (status <> 'cancelled');

-- ── Índices (FKs + consultas de agenda) ────────────────────────────────────

create index appointments_barber_starts_idx
  on public.appointments (barber_id, starts_at);
create index appointments_service_idx
  on public.appointments (service_id);
create index appointments_starts_idx
  on public.appointments (starts_at);
create index working_hours_barber_idx
  on public.working_hours (barber_id, weekday);
create index time_blocks_barber_starts_idx
  on public.time_blocks (barber_id, starts_at);
create index time_blocks_starts_idx
  on public.time_blocks (starts_at);

-- ── RLS ────────────────────────────────────────────────────────────────────
-- Catálogo (barbers/services/working_hours): leitura pública.
-- Dados sensíveis (appointments/time_blocks): nenhum acesso anon;
-- o site escreve via Server Action com service role (bypassa RLS)
-- e o admin autenticado tem acesso total.

alter table public.barbers enable row level security;
alter table public.services enable row level security;
alter table public.working_hours enable row level security;
alter table public.time_blocks enable row level security;
alter table public.appointments enable row level security;

create policy "anon_read_active_barbers"
  on public.barbers for select
  to anon
  using (active);

create policy "anon_read_active_services"
  on public.services for select
  to anon
  using (active);

create policy "anon_read_working_hours"
  on public.working_hours for select
  to anon
  using (true);

-- Admin (único usuário autenticado do projeto; signups públicos desativados)
create policy "authenticated_all_barbers"
  on public.barbers for all
  to authenticated
  using (true) with check (true);

create policy "authenticated_all_services"
  on public.services for all
  to authenticated
  using (true) with check (true);

create policy "authenticated_all_working_hours"
  on public.working_hours for all
  to authenticated
  using (true) with check (true);

create policy "authenticated_all_time_blocks"
  on public.time_blocks for all
  to authenticated
  using (true) with check (true);

create policy "authenticated_all_appointments"
  on public.appointments for all
  to authenticated
  using (true) with check (true);
