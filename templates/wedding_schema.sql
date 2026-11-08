-- =====================================================================
-- Wedding invitation: Supabase (PostgreSQL) schema + DUMMY DATA
-- Run the whole file once in: Supabase dashboard > SQL Editor > New query
--
-- Security model
--   * Each wedding gets its own slug (e.g. amara-dewa-k7x2q9).
--   * Guests are anonymous. They never read or write tables directly.
--     They call small RPC functions, identified by their secret `code`.
--   * Row-level security isolates every row by slug: public key can only
--     read/write rows where slug = APP_CONFIG.SLUG.
--   * Phone numbers are readable only by the admin (a logged-in user
--     listed in `admins`).
--   * Anyone can read visible wishes (name, message, date only).
-- =====================================================================

-- ---------- 1. Tables -------------------------------------------------

-- Each deployed invitation gets one row here, keyed by its unique slug.
create table if not exists public.weddings (
  id        uuid primary key default gen_random_uuid(),
  slug      text not null unique,
  owner     uuid references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create table if not exists public.guests (
  id            uuid primary key default gen_random_uuid(),
  wedding_id    uuid not null references public.weddings(id) on delete cascade,
  code          text not null unique
                default substr(replace(gen_random_uuid()::text, '-', ''), 1, 10),
  name          text not null check (char_length(name) between 1 and 120),
  phone         text not null check (phone ~ '^[0-9]{8,16}$'),   -- 62812..., no +
  lang          text not null default 'id' check (lang in ('id', 'en')),
  sent_status   text not null default 'new' check (sent_status in ('new', 'sent')),
  sent_at       timestamptz,
  opened_at     timestamptz,                                      -- first open
  last_opened_at timestamptz,
  open_count    integer not null default 0,
  rsvp          text not null default 'pending'
                check (rsvp in ('pending', 'attending', 'declined')),
  pax           integer not null default 1 check (pax between 0 and 20),
  rsvp_at       timestamptz,
  created_at    timestamptz not null default now()
);

create table if not exists public.wishes (
  id          uuid primary key default gen_random_uuid(),
  wedding_id  uuid not null references public.weddings(id) on delete cascade,
  guest_id    uuid not null unique references public.guests(id) on delete cascade,
  name        text not null,                                      -- copied from guest
  message     text not null check (char_length(message) between 1 and 500),
  is_visible  boolean not null default true,                      -- admin can hide
  created_at  timestamptz not null default now()
);

-- One row of site settings (couple's WhatsApp, templates, page address)
create table if not exists public.settings (
  id           integer primary key default 1 check (id = 1),
  wedding_id   uuid not null references public.weddings(id) on delete cascade,
  couple_phone text not null default '6281234567890',
  base_url     text not null default 'https://your-site.netlify.app',
  template_en  text not null default 'Dear {name}, with joy Amara & Dewa invite you to our wedding on 13 March 2027. Your personal invitation: {link}',
  template_id  text not null default 'Yth. {name}, dengan sukacita Amara & Dewa mengundang Anda ke pernikahan kami pada 13 Maret 2027. Undangan pribadi Anda: {link}'
);
insert into public.settings (id) values (1) on conflict (id) do nothing;

create index if not exists guests_rsvp_idx on public.guests (rsvp);
create index if not exists guests_wedding_idx on public.guests (wedding_id);
create index if not exists wishes_visible_idx on public.wishes (is_visible, created_at desc);
create index if not exists wishes_wedding_idx on public.wishes (wedding_id);

-- ---------- 2. Admin helper + row level security ----------------------

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.admins where user_id = auth.uid()); $$;

-- Determine the current slug from a session variable set by the app.
-- The generated site sets `app.current_slug` via `supabase.from('_rpc').single()` —
-- instead we pass slug explicitly to each RPC and use it inside security definer
-- functions below. For plain table access, RLS uses `current_setting('app.slug')`.
create or replace function public.current_wedding_id()
returns uuid
language sql stable security definer set search_path = public
as $$
  select w.id from public.weddings w
  where w.slug = current_setting('app.slug', true)
  limit 1;
$$;

alter table public.weddings   enable row level security;
alter table public.admins     enable row level security;
alter table public.guests     enable row level security;
alter table public.wishes     enable row level security;
alter table public.settings   enable row level security;

-- Admin: full access
create policy admins_admin   on public.admins   for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy guests_admin   on public.guests   for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy wishes_admin   on public.wishes   for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy settings_admin on public.settings for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy weddings_admin on public.weddings for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Weddings: public can read own slug's row (for admin lookup of wedding_id)
create policy weddings_public_read on public.weddings for select to anon using (slug = current_setting('app.slug', true));

-- Public: read visible wishes, scoped to current slug
create policy wishes_public_read on public.wishes for select to anon
  using (is_visible and wedding_id = public.current_wedding_id());
revoke all on public.wishes from anon;
grant select (name, message, created_at) on public.wishes to anon;

-- Anonymous visitors get nothing else directly
revoke all on public.guests, public.settings, public.admins, public.weddings from anon;

-- ---------- 3. Guest-facing functions (the only way guests write) -----

-- Called when the invitation page loads. Records the open, returns safe fields.
-- p_slug is the wedding slug; p_code is the guest's personal code.
create or replace function public.open_invitation(p_slug text, p_code text)
returns json
language plpgsql security definer set search_path = public
as $$
declare g public.guests; wid uuid;
begin
  select id into wid from public.weddings where slug = p_slug limit 1;
  if not found then return null; end if;

  update public.guests
     set opened_at      = coalesce(opened_at, now()),
         last_opened_at = now(),
         open_count     = open_count + 1
   where code = p_code and wedding_id = wid
   returning * into g;
  if not found then return null; end if;

  return json_build_object(
    'name', g.name, 'lang', g.lang, 'rsvp', g.rsvp, 'pax', g.pax,
    'wish', (select w.message from public.wishes w where w.guest_id = g.id),
    'couple_phone', (select couple_phone from public.settings where id = 1 and wedding_id = wid)
  );
end $$;

create or replace function public.submit_rsvp(p_slug text, p_code text, p_rsvp text, p_pax integer)
returns json
language plpgsql security definer set search_path = public
as $$
declare g public.guests; wid uuid;
begin
  if p_rsvp not in ('attending', 'declined') then
    raise exception 'invalid rsvp';
  end if;
  select id into wid from public.weddings where slug = p_slug limit 1;
  if not found then raise exception 'unknown wedding'; end if;

  update public.guests
     set rsvp = p_rsvp,
         pax = case when p_rsvp = 'attending' then greatest(1, least(coalesce(p_pax, 1), 20)) else 0 end,
         rsvp_at = now()
   where code = p_code and wedding_id = wid
   returning * into g;
  if not found then raise exception 'unknown code'; end if;
  return json_build_object('rsvp', g.rsvp, 'pax', g.pax);
end $$;

-- One wish per guest; sending again replaces it.
create or replace function public.submit_wish(p_slug text, p_code text, p_message text)
returns json
language plpgsql security definer set search_path = public
as $$
declare g public.guests; m text := btrim(coalesce(p_message, '')); wid uuid;
begin
  if char_length(m) = 0 or char_length(m) > 500 then
    raise exception 'message must be 1 to 500 characters';
  end if;
  select id into wid from public.weddings where slug = p_slug limit 1;
  if not found then raise exception 'unknown wedding'; end if;

  select * into g from public.guests where code = p_code and wedding_id = wid;
  if not found then raise exception 'unknown code'; end if;

  insert into public.wishes (wedding_id, guest_id, name, message)
  values (wid, g.id, g.name, m)
  on conflict (guest_id)
  do update set message = excluded.message, created_at = now();
  return json_build_object('ok', true);
end $$;

-- Claim a slug: inserts into weddings and fails on duplicates.
-- The studio calls this to check slug availability before generating a ZIP.
create or replace function public.claim_slug(p_slug text, p_owner uuid default null)
returns uuid
language plpgsql security definer set search_path = public
as $$
declare new_id uuid;
begin
  insert into public.weddings (slug, owner)
  values (p_slug, p_owner)
  returning id into new_id;
  return new_id;
exception when unique_violation then
  raise exception 'slug already taken: %', p_slug;
end $$;

revoke all on function public.open_invitation(text, text), public.submit_rsvp(text, text, text, integer), public.submit_wish(text, text, text), public.claim_slug(text, uuid) from public;
grant execute on function public.open_invitation(text, text), public.submit_rsvp(text, text, text, integer), public.submit_wish(text, text, text) to anon, authenticated;
grant execute on function public.claim_slug(text, uuid) to anon, authenticated;

-- ---------- 4. Admin summary view (obeys RLS: admin only) -------------

create or replace view public.guest_summary with (security_invoker = true) as
select
  count(*)                                              as total_guests,
  count(*) filter (where sent_status = 'sent')          as sent,
  count(*) filter (where opened_at is not null)         as opened,
  count(*) filter (where rsvp = 'attending')            as attending,
  count(*) filter (where rsvp = 'declined')             as declined,
  count(*) filter (where rsvp = 'pending')              as waiting,
  coalesce(sum(pax) filter (where rsvp = 'attending'), 0) as people_coming
from public.guests;

-- ---------- 5. Make yourself admin ------------------------------------
-- a) Dashboard > Authentication > Users > Add user (your email + password)
-- b) Then run this with your email:
--
-- insert into public.admins (user_id)
-- select id from auth.users where email = 'you@example.com';

-- ---------- 6. DUMMY DATA (safe to delete before the real event) ------
-- To remove later: delete from public.guests where code like 'DEMO%';
-- Note: dummy data must reference a valid wedding row.

-- insert into public.weddings (slug, owner) values ('demo-wedding-abc123', null)
-- on conflict (slug) do nothing;

-- insert into public.guests (wedding_id, code, name, phone, lang, sent_status, sent_at, opened_at, last_opened_at, open_count, rsvp, pax, rsvp_at) values
--  ((select id from public.weddings where slug = 'demo-wedding-abc123'), 'DEMO000001', 'Budi Santoso',   '6281234500001', 'id', 'sent', now() - interval '3 days', now() - interval '2 days', now() - interval '1 day', 3, 'attending', 2, now() - interval '2 days'),
--  ((select id from public.weddings where slug = 'demo-wedding-abc123'), 'DEMO000002', 'Jane Lee',       '61400000002',   'en', 'sent', now() - interval '3 days', now() - interval '2 days', now() - interval '2 days', 1, 'attending', 1, now() - interval '2 days'),
--  ((select id from public.weddings where slug = 'demo-wedding-abc123'), 'DEMO000003', 'Siti Rahayu',    '6281234500003', 'id', 'sent', now() - interval '2 days', now() - interval '1 day',  now() - interval '1 day',  2, 'declined',  0, now() - interval '1 day'),
--  ((select id from public.weddings where slug = 'demo-wedding-abc123'), 'DEMO000004', 'Keluarga Wijaya','6281234500004', 'id', 'sent', now() - interval '1 day',  now() - interval '5 hours', now() - interval '5 hours', 1, 'pending',   1, null),
--  ((select id from public.weddings where slug = 'demo-wedding-abc123'), 'DEMO000005', 'Michael Tan',    '6598760005',    'en', 'sent', now() - interval '1 day',  null, null, 0, 'pending', 1, null),
--  ((select id from public.weddings where slug = 'demo-wedding-abc123'), 'DEMO000006', 'Ayu Lestari',    '6281234500006', 'id', 'new',  null,                      null, null, 0, 'pending', 1, null)
-- on conflict (code) do nothing;

-- insert into public.wishes (wedding_id, guest_id, name, message)
-- select (select id from public.weddings where slug = 'demo-wedding-abc123'), id, name, 'Sample wish. Selamat menempuh hidup baru, semoga bahagia selalu!'
--   from public.guests where code = 'DEMO000001'
-- on conflict (guest_id) do nothing;

-- Admin check without recursion
create or replace function public.am_i_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select public.is_admin(); $$;
revoke all on function public.am_i_admin() from public;
grant execute on function public.am_i_admin() to authenticated;