-- service_role bypasses RLS, but RLS bypass and table GRANTs are separate
-- things in Postgres: a role still needs base privileges on a table before
-- RLS is even consulted. With "automatically expose new tables" turned off
-- in the dashboard, that automatic grant never happened for service_role
-- either (only `authenticated` was granted explicitly in the earlier
-- migrations), so anything using the service_role / secret key — admin
-- scripts, seeding, future server-only tooling — would otherwise get
-- "permission denied for table ...". Fix: grant it everything, once, here.

grant usage on schema public to service_role;

grant all privileges on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;
grant all privileges on all functions in schema public to service_role;

-- And anything created after this migration too.
alter default privileges in schema public
  grant all privileges on tables to service_role;
alter default privileges in schema public
  grant all privileges on sequences to service_role;
alter default privileges in schema public
  grant all privileges on functions to service_role;
