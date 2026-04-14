create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text unique not null,
  phone text,
  role text not null check (role in ('admin', 'direccion', 'operaciones', 'agente')),
  is_active boolean not null default true,
  default_commission_pct numeric(5,2) default 50.00,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text,
  phone text,
  client_type text,
  preferences jsonb default '{}'::jsonb,
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.providers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_name text,
  email text,
  phone text,
  default_currency text,
  payment_terms text,
  payment_method text,
  bank_details jsonb default '{}'::jsonb,
  destinations text[],
  avg_commission_pct numeric(5,2),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  quote_number text unique not null,
  title text not null,
  client_id uuid references public.clients(id),
  owner_agent_id uuid not null references public.profiles(id),
  status text not null default 'draft'
    check (status in ('draft', 'cotizacion', 'en-proceso', 'confirmada', 'cancelada', 'archivada')),
  destination_main text,
  destinations_extra text[],
  departure_date date,
  return_date date,
  pax_count integer default 1,
  trip_type text,
  presentation_currency text not null default 'USD',
  validity_date date,
  payment_terms text,
  notes_internal text,
  notes_client text,
  current_version_number integer not null default 0,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quote_collaborators (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  invite_status text not null default 'pending'
    check (invite_status in ('pending', 'accepted', 'declined', 'revoked')),
  permission_level text not null default 'editor'
    check (permission_level in ('viewer', 'editor')),
  invited_by uuid references public.profiles(id),
  invited_at timestamptz not null default now(),
  accepted_at timestamptz
);

create table if not exists public.quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  category text not null,
  subcategory text,
  title text not null,
  provider_id uuid references public.providers(id),
  description_client text,
  description_internal text,
  quantity numeric(10,2) default 1,
  pax numeric(10,2) default 1,
  unit_cost numeric(14,2) default 0,
  taxes numeric(14,2) default 0,
  currency text not null default 'USD',
  fx_rate numeric(14,6) default 1,
  calc_mode text not null default 'markup_pct'
    check (calc_mode in ('markup_pct', 'fee_fixed', 'commission_pct', 'direct_price')),
  markup_pct numeric(8,2) default 0,
  fee_amount numeric(14,2) default 0,
  cc_markup_enabled boolean not null default false,
  cc_markup_pct numeric(8,2) default 5,
  final_price numeric(14,2) default 0,
  profit_amount numeric(14,2) default 0,
  agent_commission_pct numeric(8,2) default 50,
  agent_commission_amount numeric(14,2) default 0,
  show_to_client boolean not null default true,
  show_price_to_client boolean not null default true,
  group_label text,
  sort_order integer default 0,
  payment_due_date date,
  provider_deposit_pct numeric(8,2),
  reservation_reference text,
  cost_center text,
  responsible_user_id uuid references public.profiles(id),
  metadata_json jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quote_versions (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  version_number integer not null,
  snapshot_json jsonb not null,
  total_final numeric(14,2) default 0,
  total_cost numeric(14,2) default 0,
  total_profit numeric(14,2) default 0,
  presentation_currency text not null default 'USD',
  created_by uuid references public.profiles(id),
  change_summary text,
  created_at timestamptz not null default now(),
  unique (quote_id, version_number)
);

create table if not exists public.quote_change_log (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  user_id uuid references public.profiles(id),
  action_type text not null,
  entity_type text not null,
  entity_id uuid,
  field_name text,
  old_value text,
  new_value text,
  created_at timestamptz not null default now()
);

create table if not exists public.generated_files (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  version_id uuid references public.quote_versions(id) on delete set null,
  file_type text not null check (file_type in ('pdf_cliente', 'sheet_interno', 'preview_html')),
  storage_path text not null,
  generated_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);
