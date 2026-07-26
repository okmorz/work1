-- expenses: 支出記録
create table expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  date date not null,
  amount integer not null,
  memo text,
  category text not null check (category in ('食費','生活費','趣味','外食費','衣類','その他')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- savings_goals: 貯金目標
create table savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  yearly_target_amount integer not null,
  start_month text not null, -- 'YYYY-MM'
  end_month text not null,   -- 'YYYY-MM'
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index expenses_user_id_date_idx on expenses (user_id, date);
create index savings_goals_user_id_idx on savings_goals (user_id);

-- Row Level Security: 自分の行のみ読み書き可能
alter table expenses enable row level security;
alter table savings_goals enable row level security;

create policy "expenses_select_own" on expenses
  for select using (auth.uid() = user_id);
create policy "expenses_insert_own" on expenses
  for insert with check (auth.uid() = user_id);
create policy "expenses_update_own" on expenses
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "expenses_delete_own" on expenses
  for delete using (auth.uid() = user_id);

create policy "savings_goals_select_own" on savings_goals
  for select using (auth.uid() = user_id);
create policy "savings_goals_insert_own" on savings_goals
  for insert with check (auth.uid() = user_id);
create policy "savings_goals_update_own" on savings_goals
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "savings_goals_delete_own" on savings_goals
  for delete using (auth.uid() = user_id);
