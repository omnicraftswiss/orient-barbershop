-- Run this in the Supabase SQL editor if you already ran schema.sql
-- and are getting "permission denied" errors.

grant select                  on public.barbers            to anon, authenticated, service_role;
grant select                  on public.services           to anon, authenticated, service_role;
grant select                  on public.barber_schedules   to anon, authenticated, service_role;
grant select                  on public.barber_exceptions  to anon, authenticated, service_role;
grant select, insert, update  on public.bookings           to anon, authenticated, service_role;
grant select                  on public.products           to anon, authenticated, service_role;
grant select, insert, update  on public.customers          to authenticated, service_role;
grant select, insert          on public.product_sales      to authenticated, service_role;
grant select, insert, update  on public.analytics_events   to service_role;
grant select, insert          on public.consent_records    to authenticated, service_role;
grant select, insert, update  on public.user_roles         to service_role;
