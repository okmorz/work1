# 家計簿アプリ（work1）

年間の貯金目標から「今月・今日あといくら使えるか」を可視化する家計簿アプリ。

## 技術スタック

- フロントエンド: React + TypeScript + Vite
- スタイリング: Tailwind CSS
- ルーティング: React Router
- グラフ: Recharts
- データ永続化: ブラウザ `localStorage`（即時反映・オフライン対応）
- データ同期・認証: [Supabase](https://supabase.com/)（PostgreSQL + Auth + 自動生成REST API）
- ホスティング: GitHub Pages（静的サイト）

## 現在の状態

プロジェクトの雛形とディレクトリ構成のみが用意されています。認証・データ入力・Supabase同期などの機能は未実装です。

## セットアップ

```bash
npm install
cp .env.example .env   # VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY を設定
npm run dev
```

### Supabaseのセットアップ

テーブル定義・RLSポリシーは [supabase/migrations/](supabase/migrations/) にSQLとして管理しています。

#### ローカル開発（Docker Desktopが必要）

```bash
npx supabase start        # ローカルにPostgres/Auth/Studioなどを起動（初回はDockerイメージの取得あり）
```

起動後にターミナルへ表示される `API URL` と `anon key` を `.env` の `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` に設定してください。マイグレーションは `supabase start` 時、および `npx supabase db reset` 実行時に自動的に適用されます。Supabase Studio（`http://127.0.0.1:54323`）からテーブルやAuthユーザーを確認できます。

#### クラウド上のSupabaseプロジェクトを使う場合

1. [Supabase](https://supabase.com/dashboard) で新規プロジェクトを作成する
2. 以下のいずれかの方法でマイグレーションを適用する
   - SQL Editorで [supabase/migrations/20260726231826_init_schema.sql](supabase/migrations/20260726231826_init_schema.sql) の内容を実行する
   - または `npx supabase link --project-ref <project-ref>` でプロジェクトを紐付け、`npx supabase db push` でマイグレーションを適用する
3. Authentication > Providers で Email（Password もしくは Magic Link）を有効化する
4. Project Settings > API から `Project URL` と `anon public` キーを取得し、`.env` に設定する

GitHub Pagesへのデプロイ手順は、デプロイ機能の実装時にあわせて追記します。

## 注意点

- Supabaseとの同期は「アプリを開いている間」のみ有効です。ブラウザ/PWAはタブを閉じている間バックグラウンド処理を実行できないため、定期的な自動再同期はアプリが開いている間に限られます。
- `.env` はリポジトリに含めません（`.gitignore` で除外）。GitHub Pagesへデプロイするとビルド成果物に `VITE_SUPABASE_URL` と `anon key` が含まれ公開される想定のため、アクセス制御はSupabaseのRow Level Security (RLS) で行います。

## ディレクトリ構成

```
src/
  main.tsx              # エントリーポイント（BrowserRouterでラップ）
  App.tsx               # ルーティング定義
  index.css             # Tailwind CSS の読み込み
  vite-env.d.ts         # Vite/環境変数の型定義
  types/                # ドメイン型（Expense, SavingsGoal）
  lib/                  # supabaseClient, localStorage操作
  utils/                # 日付計算・「使える金額」計算ロジック
  pages/                # 画面単位のコンポーネント（ログイン/ダッシュボード/支出入力・一覧/目標設定）
  components/
    layout/              # 共通レイアウト・ナビゲーション
    dashboard/           # ダッシュボード用パーツ（今後追加: グラフ、月末フィードバック、同期状態表示）
    expense/             # 支出入力・一覧用パーツ（今後追加）
    goal/                # 目標設定用パーツ（今後追加）
  hooks/                 # 状態管理用カスタムフック（今後追加）
supabase/
  config.toml            # ローカルSupabase CLIの設定
  migrations/             # テーブル定義・RLSポリシーのSQL
scripts/                 # 将来的なPython拡張用（必須ではない）
```
