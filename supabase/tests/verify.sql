\set ON_ERROR_STOP on

insert into auth.users (id, email, raw_user_meta_data)
values (
  '11111111-1111-4111-8111-111111111111',
  'rina@example.com',
  '{"full_name":"Rina"}'::jsonb
);

insert into auth.users (id, email, raw_user_meta_data)
values (
  '22222222-2222-4222-8222-222222222222',
  'dimas@example.com',
  '{"full_name":"Dimas"}'::jsonb
);

do $$
begin
  if not exists (
    select 1
    from public.profiles
    where id = '11111111-1111-4111-8111-111111111111'
      and full_name = 'Rina'
  ) then
    raise exception 'Profile trigger did not create the user profile';
  end if;

  if has_table_privilege('anon', 'public.profiles', 'select') then
    raise exception 'anon must not read profiles';
  end if;

  if has_column_privilege('anon', 'public.widgets', 'user_id', 'select') then
    raise exception 'anon must not read widget owners';
  end if;

  if not has_column_privilege('anon', 'public.widgets', 'config', 'select') then
    raise exception 'anon must read public widget configuration';
  end if;

  if has_column_privilege('authenticated', 'public.profiles', 'email', 'update') then
    raise exception 'Profile email must not be client-editable';
  end if;

  if not has_column_privilege('authenticated', 'public.profiles', 'full_name', 'update') then
    raise exception 'Profile name must be client-editable';
  end if;
end;
$$;

set role authenticated;
set request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

insert into public.widgets (user_id, title, type, theme_mode, font_family, config)
values (
  '11111111-1111-4111-8111-111111111111',
  'Launch clock',
  'clock',
  'system',
  'sans',
  '{"format":"24","showSeconds":true,"showDate":true,"timezone":"auto"}'::jsonb
);

select pg_sleep(0.01);

update public.widgets
set title = 'Launch clock, edited'
where user_id = '11111111-1111-4111-8111-111111111111';

do $$
begin
  if (select count(*) from public.widgets) <> 1 then
    raise exception 'Authenticated owner could not insert and read a widget';
  end if;

  if not exists (
    select 1 from public.widgets
    where title = 'Launch clock, edited'
      and updated_at > created_at
  ) then
    raise exception 'Widget updated_at trigger did not run';
  end if;

  begin
    insert into public.widgets (user_id, title, type, theme_mode, font_family, config)
    values (
      '22222222-2222-4222-8222-222222222222',
      'Wrong owner',
      'clock',
      'system',
      'sans',
      '{"format":"24"}'::jsonb
    );
    raise exception 'RLS allowed a user to create a widget for another owner';
  exception
    when insufficient_privilege then null;
  end;
end;
$$;

reset role;
set role anon;

do $$
begin
  if (select count(*) from public.widgets) <> 1 then
    raise exception 'Anonymous embed client could not read the public widget';
  end if;
end;
$$;

reset role;
