-- LOCAL TEST ONLY. Minimal stand-ins for the parts of Supabase the migrations rely on (auth.users, auth.uid(),
-- the API roles and storage tables), so migrations and RLS tests run on a plain PostgreSQL 16.
-- Never apply this file to a Supabase project: Supabase provides the real objects.

create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then create role service_role nologin bypassrls; end if;
end $$;

create schema if not exists auth;
grant usage on schema auth to anon, authenticated, service_role;
create table auth.users (id uuid primary key default gen_random_uuid(), email text unique, created_at timestamptz default now());

create or replace function auth.uid() returns uuid language sql stable as $$
  select nullif(coalesce(current_setting('request.jwt.claim.sub', true),
                         (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')), '')::uuid
$$;
grant execute on function auth.uid() to anon, authenticated, service_role;

create schema if not exists storage;
grant usage on schema storage to anon, authenticated, service_role;
create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text references storage.buckets(id),
  name text not null, owner uuid, created_at timestamptz default now());
alter table storage.objects enable row level security;
grant select, insert, update, delete on storage.objects to authenticated;
grant all on all tables in schema public to service_role;
alter default privileges in schema public grant all on tables to service_role;
-- Supabase's default privileges: API roles get table access, RLS decides rows.
alter default privileges in schema public grant all on tables to anon, authenticated;
alter default privileges in schema public grant all on functions to anon, authenticated;
grant usage on schema public to anon, authenticated;
