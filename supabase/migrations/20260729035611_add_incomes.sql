-- incomes: 収入記録
create table incomes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  date date not null,
  amount integer not null,
  memo text,
  category text not null check (category in ('給与','副業','臨時収入','その他')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index incomes_user_id_date_idx on incomes (user_id, date);

alter table incomes enable row level security;

create policy "incomes_select_own" on incomes
  for select using (auth.uid() = user_id);
create policy "incomes_insert_own" on incomes
  for insert with check (auth.uid() = user_id);
create policy "incomes_update_own" on incomes
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "incomes_delete_own" on incomes
  for delete using (auth.uid() = user_id);

-- RLSは行を絞り込むだけで、テーブルへのアクセス自体は別途GRANTが必要
-- (20260726231826_init_schema.sql で expenses/savings_goals へのGRANT漏れがあった教訓)
grant select, insert, update, delete on incomes to authenticated;
