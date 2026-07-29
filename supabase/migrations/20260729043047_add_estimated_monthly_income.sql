-- オンボーディングで入力する「月の平均収入」の見込み値。
-- 実績データがまだない月の「使える金額」計算で暫定値として使う。
alter table savings_goals
  add column estimated_monthly_income integer not null default 0;
