-- CraftMap PostgreSQL schema (Supabase-ready).
-- Run in the Supabase SQL editor. All tables use UUID PKs + RLS-friendly shape.

create extension if not exists "pgcrypto";

create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  created_at timestamptz default now()
);

create table profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  name text not null,
  username text unique not null,
  role text not null default 'Indie Hacker',
  bio text not null default '',
  city text not null default '',
  country text not null default '',
  lat double precision not null default 0,
  lng double precision not null default 0,
  category text not null default 'SaaS',
  color text not null default '#E4562A',
  joined_at timestamptz default now()
);
create index profiles_geo_idx on profiles (lat, lng);
create index profiles_username_idx on profiles (username);

create table locations (
  id uuid primary key default gen_random_uuid(),
  city text not null, country text not null,
  lat double precision not null, lng double precision not null,
  unique (city, country)
);

create table businesses (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete set null,
  name text not null, tagline text not null default '',
  description text not null default '',
  category text not null default 'SaaS',
  city text not null default '', country text not null default '',
  lat double precision not null default 0, lng double precision not null default 0,
  website text not null default '', mrr text not null default '—', users text not null default '—',
  color text not null default '#E4562A',
  created_at timestamptz default now()
);

create table products (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,
  name text not null, url text not null default '',
  created_at timestamptz default now()
);

create table social_links (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  business_id uuid references businesses(id) on delete cascade,
  network text not null, url text not null,
  check ((profile_id is not null) or (business_id is not null))
);

create table interests (id uuid primary key default gen_random_uuid(), name text unique not null);
create table skills (id uuid primary key default gen_random_uuid(), name text unique not null);

create table profile_interests (
  profile_id uuid references profiles(id) on delete cascade,
  interest_id uuid references interests(id) on delete cascade,
  primary key (profile_id, interest_id)
);
create table profile_skills (
  profile_id uuid references profiles(id) on delete cascade,
  skill_id uuid references skills(id) on delete cascade,
  primary key (profile_id, skill_id)
);

create table map_markers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  business_id uuid references businesses(id) on delete cascade,
  lat double precision not null, lng double precision not null,
  kind text not null default 'person'
);
create index map_markers_geo_idx on map_markers (lat, lng);

create table promotion_plans (
  tier text primary key,
  name text not null, price_cents int not null,
  blurb text not null default ''
);
insert into promotion_plans (tier, name, price_cents, blurb) values
  ('pin','Standard Pin',900,'Branded pin at city zoom'),
  ('boat','Boat',2900,'Floats on water near your city'),
  ('ship','Ship',7900,'Visible across the region'),
  ('yacht','Yacht',14900,'Country-level visibility'),
  ('landmark','Landmark',29900,'Global visibility + homepage feature')
on conflict do nothing;

create table sponsored_placements (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,
  tier text references promotion_plans(tier) not null,
  lat double precision not null, lng double precision not null,
  label text not null default '',
  active boolean default true,
  created_at timestamptz default now()
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  placement_id uuid references sponsored_placements(id) on delete set null,
  stripe_session_id text unique,
  amount_cents int not null, currency text not null default 'usd',
  status text not null default 'pending',
  created_at timestamptz default now()
);

create table meetups (
  id uuid primary key default gen_random_uuid(),
  title text not null, city text not null default '', country text not null default '',
  lat double precision not null default 0, lng double precision not null default 0,
  date_text text not null default '', attendees int not null default 0,
  host text not null default '', tags text[] not null default '{}'
);

create table posts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  text text not null, created_at timestamptz default now()
);

create table followers (
  follower_id uuid references profiles(id) on delete cascade,
  following_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (follower_id, following_id)
);

create table favorites (
  profile_id uuid references profiles(id) on delete cascade,
  target_kind text not null, target_id text not null,
  created_at timestamptz default now(),
  primary key (profile_id, target_kind, target_id)
);

create table activity (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  text text not null, created_at timestamptz default now()
);
create index activity_profile_idx on activity (profile_id, created_at desc);
