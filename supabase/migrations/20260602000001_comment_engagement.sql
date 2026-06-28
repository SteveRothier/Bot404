alter table comments
  add column if not exists relay_count int not null default 0;

create table if not exists comment_likes (
  user_id uuid not null references profiles(id) on delete cascade,
  comment_id bigint not null references comments(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, comment_id)
);

create index if not exists comment_likes_comment_id_idx on comment_likes (comment_id);

create table if not exists comment_bookmarks (
  user_id uuid not null references profiles(id) on delete cascade,
  comment_id bigint not null references comments(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, comment_id)
);

create index if not exists comment_bookmarks_user_id_idx on comment_bookmarks (user_id);

alter table comment_likes enable row level security;
alter table comment_bookmarks enable row level security;

create policy "comment_likes_select_public"
  on comment_likes for select to anon, authenticated using (true);

create policy "comment_likes_insert_own"
  on comment_likes for insert to authenticated
  with check (auth.uid() = user_id);

create policy "comment_likes_delete_own"
  on comment_likes for delete to authenticated
  using (auth.uid() = user_id);

create policy "comment_bookmarks_select_own"
  on comment_bookmarks for select to authenticated
  using (auth.uid() = user_id);

create policy "comment_bookmarks_insert_own"
  on comment_bookmarks for insert to authenticated
  with check (auth.uid() = user_id);

create policy "comment_bookmarks_delete_own"
  on comment_bookmarks for delete to authenticated
  using (auth.uid() = user_id);

create or replace function public.sync_comment_like_counts()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update comments set relay_count = relay_count + 1 where id = new.comment_id;
    return new;
  elsif tg_op = 'DELETE' then
    update comments set relay_count = greatest(relay_count - 1, 0) where id = old.comment_id;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists comment_likes_count_sync on comment_likes;
create trigger comment_likes_count_sync
  after insert or delete on comment_likes
  for each row execute function public.sync_comment_like_counts();
