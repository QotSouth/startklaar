-- ============================================================================
-- Startklaar klantenportaal — database schema
-- Run dit volledige script in de Supabase SQL editor.
-- ============================================================================

-- Nodig voor gen_random_uuid()
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- TABELLEN
-- ----------------------------------------------------------------------------

create table if not exists public.clients (
  id         uuid primary key default gen_random_uuid(),
  name       text,
  email      text unique not null,
  phone      text,
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id                     uuid primary key default gen_random_uuid(),
  client_id              uuid references public.clients(id) on delete cascade,
  project_name           text not null,
  package_name           text,
  status                 text not null default 'intake_received',
  expected_delivery_date date,
  client_message         text,
  internal_notes         text,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  -- Alleen de 6 toegestane statussen.
  constraint projects_status_check check (
    status in (
      'intake_received',
      'in_design',
      'feedback_requested',
      'finalizing',
      'ready_for_download',
      'completed'
    )
  )
);

create table if not exists public.project_files (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid references public.projects(id) on delete cascade,
  file_name     text,
  file_category text,
  file_url      text,
  storage_path  text,
  uploaded_at   timestamptz not null default now()
);

-- Handige indexen
create index if not exists projects_client_id_idx on public.projects(client_id);
create index if not exists project_files_project_id_idx on public.project_files(project_id);

-- ----------------------------------------------------------------------------
-- updated_at trigger voor projects
-- ----------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row
  execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS)
-- ----------------------------------------------------------------------------
-- We zetten RLS aan op alle tabellen. De klant (authenticated) mag ALLEEN
-- zijn eigen rijen LEZEN: rijen die gekoppeld zijn aan een client waarvan
-- het e-mailadres gelijk is aan het e-mailadres in zijn JWT (auth.email()).
--
-- Er zijn GEEN insert/update/delete policies voor anon/authenticated.
-- Alle schrijfbewerkingen gebeuren server-side met de SERVICE ROLE key,
-- die RLS volledig omzeilt. De service role mag dus alles; de klant niets
-- behalve zijn eigen data lezen.
-- ----------------------------------------------------------------------------

alter table public.clients       enable row level security;
alter table public.projects      enable row level security;
alter table public.project_files enable row level security;

-- clients: klant ziet enkel zijn eigen klantrij (match op e-mail in JWT).
drop policy if exists "clients_select_own" on public.clients;
create policy "clients_select_own"
  on public.clients
  for select
  to authenticated
  using ( email = auth.email() );

-- projects: klant ziet enkel projecten van zijn eigen client(s).
drop policy if exists "projects_select_own" on public.projects;
create policy "projects_select_own"
  on public.projects
  for select
  to authenticated
  using (
    client_id in (
      select id from public.clients where email = auth.email()
    )
  );

-- project_files: klant ziet enkel bestanden van zijn eigen projecten.
drop policy if exists "project_files_select_own" on public.project_files;
create policy "project_files_select_own"
  on public.project_files
  for select
  to authenticated
  using (
    project_id in (
      select p.id
      from public.projects p
      join public.clients c on c.id = p.client_id
      where c.email = auth.email()
    )
  );

-- ----------------------------------------------------------------------------
-- STORAGE NOTE
-- ----------------------------------------------------------------------------
-- Maak in Supabase Storage een bucket aan met de naam: project-files
-- Deze bucket MOET PRIVAAT zijn (NIET public). Downloads gebeuren via
-- server-side gegenereerde signed URLs nadat de toegang is gecontroleerd.
-- De service role key (server-only) gebruikt voor upload/delete/signing.
-- ----------------------------------------------------------------------------
