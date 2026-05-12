-- ================================================================
-- Orient Barber — Supabase Schema
-- Run this in the Supabase SQL editor to set up the database.
-- ================================================================

-- ================================================================
-- TABLES
-- ================================================================

create table if not exists public.barbers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  bio text,
  photo_url text,
  specialties text[] default '{}',
  is_active boolean default true,
  display_order integer default 0,
  created_at timestamptz default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  duration_minutes integer not null,
  price_chf numeric(10,2) not null,
  category text default 'haircut',
  is_active boolean default true,
  display_order integer default 0
);

-- Weekly recurring availability per barber (0=Mon ... 6=Sun)
create table if not exists public.barber_schedules (
  id uuid primary key default gen_random_uuid(),
  barber_id uuid references public.barbers(id) on delete cascade,
  day_of_week integer not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  is_active boolean default true,
  unique(barber_id, day_of_week)
);

-- Overrides: holidays, sick days, special hours
create table if not exists public.barber_exceptions (
  id uuid primary key default gen_random_uuid(),
  barber_id uuid references public.barbers(id) on delete cascade,
  exception_date date not null,
  is_day_off boolean default false,
  start_time time,
  end_time time,
  reason text
);

-- Customer profiles (linked to Supabase auth users)
create table if not exists public.customers (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  phone text,
  postal_code text,        -- 4-digit Swiss PLZ
  birth_year integer,      -- not full DOB — used for age group bucket only
  analytics_consent boolean default false,
  marketing_consent boolean default false,
  consent_version text default '1.0',
  consent_date timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id),
  barber_id uuid references public.barbers(id),
  service_id uuid references public.services(id),
  booking_date date not null,
  start_time time not null,
  end_time time not null,
  status text default 'confirmed' check (status in ('confirmed','cancelled','completed','no_show')),
  notes text,
  -- Snapshot values (prices/names can change later)
  price_chf numeric(10,2),
  service_name text,
  barber_name text,
  -- Guest booking fields (no account required)
  guest_first_name text,
  guest_last_name text,
  guest_email text,
  guest_phone text,
  guest_postal_code text,
  guest_birth_year integer,
  guest_analytics_consent boolean default false,
  reminder_sent boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand text,
  category text,           -- styling, beard, skincare, shampoo, tools
  price_chf numeric(10,2),
  is_active boolean default true
);

create table if not exists public.product_sales (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id),
  product_id uuid references public.products(id),
  quantity integer default 1,
  price_at_time numeric(10,2),
  created_at timestamptz default now()
);

-- Fully anonymized analytics — NO PII, safe for B2B export/resale
-- Written only when customer has given analytics_consent = true
create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,           -- booking_completed, no_show, cancellation
  service_category text,              -- haircut, beard, combo, kids, facial
  spend_bucket text,                  -- <30, 30-60, 60-100, 100+
  postal_prefix text,                 -- first 2 digits of Swiss PLZ (regional, not precise)
  age_group text,                     -- 18-24, 25-34, 35-44, 45-54, 55+
  day_of_week integer,                -- 0=Mon, 6=Sun
  time_bucket text,                   -- morning (10-13), afternoon (13-17), evening (17-20)
  month_year text,                    -- YYYY-MM for time-series
  visit_frequency_bucket text,        -- first_time, 2-4_per_year, monthly, biweekly_plus
  product_categories text[] default '{}',
  shop_id uuid,                       -- for multi-tenant future use
  created_at timestamptz default now()
  -- Intentionally NO customer_id, booking_id, name, email, phone
);

-- Consent audit trail (legal record of what was agreed to and when)
create table if not exists public.consent_records (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id),
  consent_type text not null,         -- analytics, marketing, terms
  version text default '1.0',
  granted boolean not null,
  ip_hash text,                       -- SHA-256 of IP, never raw IP
  created_at timestamptz default now()
);

-- Admin/barber role management
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique,
  role text not null check (role in ('admin', 'barber')),
  created_at timestamptz default now()
);

-- ================================================================
-- INDEXES
-- ================================================================

create index if not exists idx_bookings_date on public.bookings(booking_date);
create index if not exists idx_bookings_barber_date on public.bookings(barber_id, booking_date);
create index if not exists idx_bookings_status on public.bookings(status);
create index if not exists idx_bookings_customer on public.bookings(customer_id);
create index if not exists idx_analytics_month on public.analytics_events(month_year);
create index if not exists idx_analytics_postal on public.analytics_events(postal_prefix);
create index if not exists idx_analytics_event_type on public.analytics_events(event_type);

-- ================================================================
-- ROW LEVEL SECURITY
-- ================================================================

alter table public.barbers enable row level security;
alter table public.services enable row level security;
alter table public.barber_schedules enable row level security;
alter table public.barber_exceptions enable row level security;
alter table public.customers enable row level security;
alter table public.bookings enable row level security;
alter table public.products enable row level security;
alter table public.product_sales enable row level security;
alter table public.analytics_events enable row level security;
alter table public.consent_records enable row level security;
alter table public.user_roles enable row level security;

-- Helper: is current user an admin?
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'admin'
  );
$$;

-- Barbers: public read, admin write
create policy "barbers_public_read" on public.barbers for select using (true);
create policy "barbers_admin_all"   on public.barbers for all    using (public.is_admin());

-- Services: public read, admin write
create policy "services_public_read" on public.services for select using (true);
create policy "services_admin_all"   on public.services for all    using (public.is_admin());

-- Schedules: public read, admin write
create policy "schedules_public_read" on public.barber_schedules for select using (true);
create policy "schedules_admin_all"   on public.barber_schedules for all    using (public.is_admin());

-- Exceptions: public read, admin write
create policy "exceptions_public_read" on public.barber_exceptions for select using (true);
create policy "exceptions_admin_all"   on public.barber_exceptions for all    using (public.is_admin());

-- Customers: own record only + admin
create policy "customers_own"   on public.customers for all using (id = auth.uid());
create policy "customers_admin" on public.customers for all using (public.is_admin());

-- Bookings: customers see own, anyone can insert (guest), admin sees all
create policy "bookings_own_read" on public.bookings for select using (customer_id = auth.uid());
create policy "bookings_insert"   on public.bookings for insert with check (true);
create policy "bookings_admin"    on public.bookings for all    using (public.is_admin());

-- Products: public read, admin write
create policy "products_public_read" on public.products for select using (true);
create policy "products_admin_all"   on public.products for all    using (public.is_admin());

-- Analytics: admin only (never exposed to end users)
create policy "analytics_admin_only" on public.analytics_events for all using (public.is_admin());

-- Consent records: insert own, admin reads all
create policy "consent_insert_own" on public.consent_records for insert with check (customer_id = auth.uid());
create policy "consent_admin"      on public.consent_records for all    using (public.is_admin());

-- Roles: admin only
create policy "roles_admin_only" on public.user_roles for all using (public.is_admin());

-- ================================================================
-- GRANTS — Allow anon + authenticated to access tables
-- (RLS policies control what they can see; grants allow them to try)
-- ================================================================

grant select                  on public.barbers            to anon, authenticated;
grant select                  on public.services           to anon, authenticated;
grant select                  on public.barber_schedules   to anon, authenticated;
grant select                  on public.barber_exceptions  to anon, authenticated;
grant select, insert, update  on public.bookings           to anon, authenticated;
grant select                  on public.products           to anon, authenticated;
grant select, insert, update  on public.customers          to authenticated;
grant select, insert          on public.product_sales      to authenticated;
grant select, insert          on public.analytics_events   to authenticated;
grant select, insert          on public.consent_records    to authenticated;

-- ================================================================
-- SEED DATA — Orient Barber, Gossau CH
-- ================================================================

insert into public.barbers (id, name, bio, specialties, display_order) values
(
  '11111111-1111-1111-1111-111111111111',
  'Ahmad',
  'Meister seines Fachs mit über 10 Jahren Erfahrung. Spezialisiert auf klassische Schnitte, Nassrasur und präzises Bartdesign.',
  array['Klassische Schnitte', 'Nassrasur', 'Bartdesign'],
  1
),
(
  '22222222-2222-2222-2222-222222222222',
  'Hassan',
  'Kreativität trifft Präzision. Bekannt für moderne Fades, Design-Schnitte und jugendliche Styles.',
  array['Fade Cuts', 'Design Schnitte', 'Moderne Styles'],
  2
)
on conflict (id) do nothing;

insert into public.services (id, name, description, duration_minutes, price_chf, category, display_order) values
('aaaa0001-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Haarschnitt',         'Klassisch oder modern, präzise ausgeführt',         30, 35.00, 'haircut', 1),
('aaaa0002-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Bart Trimmen',        'Shaping, Pflege und Styling',                       20, 20.00, 'beard',   2),
('aaaa0003-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Haarschnitt & Bart',  'Komplett-Service für den Mann',                     50, 50.00, 'combo',   3),
('aaaa0004-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Kinder Haarschnitt',  'Für Kinder bis 12 Jahre',                           25, 25.00, 'kids',    4),
('aaaa0005-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Nassrasur',           'Traditionelle Nassrasur mit heissem Tuch',          30, 30.00, 'beard',   5),
('aaaa0006-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Augenbrauen',         'Formen und Pflegen',                                15, 10.00, 'facial',  6)
on conflict (id) do nothing;

-- Mo–Sa 10:00–20:00 for both barbers
insert into public.barber_schedules (barber_id, day_of_week, start_time, end_time)
select b.id, d.day, '10:00'::time, '20:00'::time
from public.barbers b
cross join (select unnest(array[0,1,2,3,4,5]) as day) d
on conflict (barber_id, day_of_week) do nothing;
