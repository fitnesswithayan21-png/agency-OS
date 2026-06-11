-- Prevent privilege escalation: only the owner may change role / suspension.
create or replace function public.protect_profile_columns() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if (new.role is distinct from old.role or new.is_suspended is distinct from old.is_suspended)
     and current_user_role() is distinct from 'owner' then
    raise exception 'Only the agency owner can change roles or suspension status';
  end if;
  return new;
end $$;

create trigger trg_protect_profile_columns
  before update on profiles
  for each row execute function protect_profile_columns();
