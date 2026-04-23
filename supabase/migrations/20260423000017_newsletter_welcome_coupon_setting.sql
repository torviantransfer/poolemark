insert into public.site_settings (key, value)
values
  ('newsletter_welcome_coupon_enabled', 'false'),
  ('newsletter_welcome_coupon_code', 'HOSGELDIN10')
on conflict (key) do update
set value = excluded.value;
