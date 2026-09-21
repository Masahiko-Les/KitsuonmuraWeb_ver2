-- Extensions used across the schema.
create extension if not exists pgcrypto with schema public;

-- Shared trigger to keep updated_at columns honest.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
