create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  source text default 'footer',
  product_id text,
  product_name text,
  product_slug text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.marketing_email_logs (
  id uuid primary key default gen_random_uuid(),
  campaign_type text not null,
  recipient_email text not null,
  recipient_name text,
  subject text,
  product_slugs text[],
  status text default 'sent',
  error_message text,
  sent_at timestamptz default now()
);

alter table public.newsletter_subscribers enable row level security;
alter table public.marketing_email_logs enable row level security;

create policy if not exists "Allow public newsletter insert"
on public.newsletter_subscribers
for insert
to anon, authenticated
with check (true);

create policy if not exists "Allow public newsletter update own email"
on public.newsletter_subscribers
for update
to anon, authenticated
using (true)
with check (true);