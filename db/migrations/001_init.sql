-- Mirchi Events schema (plain PostgreSQL 13+). Applied by `npm run db:migrate`.

create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  description text,
  category_id uuid references categories(id) on delete set null,
  poster_url text,
  start_date date,
  end_date date,
  date_label text,
  venue text,
  city text,
  price_label text,
  cta_label text not null default 'Book now',
  external_url text not null,
  is_published boolean not null default true,
  is_featured boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index events_sort_idx on events (sort_order);

-- Admin accounts. Managed with `npm run admin:create` / `admin:remove`.
create table admins (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  last_login_at timestamptz,
  created_at timestamptz not null default now()
);

create function set_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger events_set_updated_at
  before update on events
  for each row execute function set_updated_at();
