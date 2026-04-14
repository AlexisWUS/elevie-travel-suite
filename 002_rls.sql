alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.providers enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_collaborators enable row level security;
alter table public.quote_items enable row level security;
alter table public.quote_versions enable row level security;
alter table public.quote_change_log enable row level security;
alter table public.generated_files enable row level security;

create or replace function public.current_user_role()
returns text
language sql
stable
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.can_access_quote(target_quote_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.quotes q
    left join public.quote_collaborators qc on qc.quote_id = q.id
    where q.id = target_quote_id
      and (
        q.owner_agent_id = auth.uid()
        or (qc.user_id = auth.uid() and qc.invite_status = 'accepted')
        or public.current_user_role() in ('admin', 'direccion', 'operaciones')
      )
  )
$$;

create policy "profiles_self_or_admin"
on public.profiles
for select
using (id = auth.uid() or public.current_user_role() in ('admin', 'direccion'));

create policy "quotes_access"
on public.quotes
for select
using (public.can_access_quote(id));

create policy "quotes_insert_owner"
on public.quotes
for insert
with check (owner_agent_id = auth.uid() or public.current_user_role() in ('admin', 'direccion'));

create policy "quotes_update_access"
on public.quotes
for update
using (public.can_access_quote(id))
with check (public.can_access_quote(id));

create policy "items_access"
on public.quote_items
for all
using (public.can_access_quote(quote_id))
with check (public.can_access_quote(quote_id));

create policy "versions_access"
on public.quote_versions
for all
using (public.can_access_quote(quote_id))
with check (public.can_access_quote(quote_id));

create policy "collaborators_access"
on public.quote_collaborators
for all
using (public.can_access_quote(quote_id))
with check (public.can_access_quote(quote_id));

create policy "change_log_access"
on public.quote_change_log
for all
using (public.can_access_quote(quote_id))
with check (public.can_access_quote(quote_id));

create policy "generated_files_access"
on public.generated_files
for all
using (public.can_access_quote(quote_id))
with check (public.can_access_quote(quote_id));

create policy "clients_team_access"
on public.clients
for select
using (public.current_user_role() in ('admin', 'direccion', 'operaciones', 'agente'));

create policy "clients_team_write"
on public.clients
for all
using (public.current_user_role() in ('admin', 'direccion', 'operaciones', 'agente'))
with check (public.current_user_role() in ('admin', 'direccion', 'operaciones', 'agente'));

create policy "providers_team_access"
on public.providers
for select
using (public.current_user_role() in ('admin', 'direccion', 'operaciones', 'agente'));

create policy "providers_team_write"
on public.providers
for all
using (public.current_user_role() in ('admin', 'direccion', 'operaciones'))
with check (public.current_user_role() in ('admin', 'direccion', 'operaciones'));
