-- docs/supabase-hero-assets.sql

-- 1. Create table for hero assets
create table if not exists hero_assets (
  id uuid primary key default gen_random_uuid(),
  video_url text not null,
  active boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Index to quickly query active row
create index if not exists idx_hero_assets_active on hero_assets(active);

-- 3. Trigger function to update the updated_at column automatically
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 4. Attach trigger to the table
drop trigger if exists update_hero_assets_updated_at on hero_assets;
create trigger update_hero_assets_updated_at
  before update on hero_assets
  for each row
  execute function update_updated_at_column();

-- 5. Row Level Security Setup
alter table hero_assets enable row level security;

-- Allow public read access to active hero videos
create policy "Allow public read access"
on hero_assets for select
to public
using (active = true);

-- Allow authenticated users (e.g. admin dashboard) to manage everything
create policy "Allow authenticated all access"
on hero_assets for all
to authenticated
using (true)
with check (true);
