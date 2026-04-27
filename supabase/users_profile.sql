create table if not exists public.users_profile (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  subscription_status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.users_profile enable row level security;

create policy "Users can read own profile"
on public.users_profile
for select
using (auth.uid() = id);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_users_profile_updated_at on public.users_profile;

create trigger set_users_profile_updated_at
before update on public.users_profile
for each row
execute function public.set_updated_at();
