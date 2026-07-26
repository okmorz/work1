-- savings_goals: one goal per user, so upsert-on-conflict(user_id) works from the client
alter table savings_goals
  add constraint savings_goals_user_id_key unique (user_id);

-- expenses: optional free-text label for the 'その他' category
alter table expenses
  add column other_category_label text;
