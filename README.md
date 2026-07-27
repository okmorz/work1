# 家計簿アプリ（work1）

年間の貯金目標から「今月・今日あといくら使えるか」を可視化する家計簿アプリ。

## 技術スタック

- フロントエンド: React + TypeScript + Vite
- スタイリング: Tailwind CSS
- ルーティング: React Router
- グラフ: Recharts
- データ永続化: ブラウザ `localStorage`（即時反映・オフライン対応）
- データ同期・認証: [Supabase](https://supabase.com/)（PostgreSQL + Auth + 自動生成REST API）
- PWA: [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)（ホーム画面への追加・静的ファイルのオフラインキャッシュ）
- ホスティング: GitHub Pages（静的サイト）

## 現在の状態

目標設定・支出記録/一覧・ダッシュボード・月末フィードバック・支出分析（統計ベース）・Supabase Authによるログイン・Supabaseへのデータ同期・PWA化まで実装済みです。GitHub Pagesへの実際のデプロイ実行は保留中です。

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

### GitHub Pagesへのデプロイ

`main` へのpushをトリガーに、[.github/workflows/deploy.yml](.github/workflows/deploy.yml) が自動的にビルド・公開します。事前に以下の設定が必要です（初回のみ）。

1. **Pagesの公開元をGitHub Actionsにする**: リポジトリの Settings → Pages → Build and deployment → Source で「GitHub Actions」を選択する
2. **クラウド上のSupabaseプロジェクトを用意する**（上記「クラウド上のSupabaseプロジェクトを使う場合」の手順）。GitHub Pagesは静的ホスティングのみで実行時に環境変数を読めないため、ローカル開発用の `http://127.0.0.1:54321`（Docker）はデプロイ後のサイトからは使えません。公開用には必ずクラウド上のプロジェクトのURL/anon keyを使ってください
3. **リポジトリSecretsを設定する**: Settings → Secrets and variables → Actions → New repository secret で以下を登録する
   - `VITE_SUPABASE_URL`: クラウドプロジェクトの Project URL
   - `VITE_SUPABASE_ANON_KEY`: クラウドプロジェクトの anon public キー

設定後、`main` にpushすると `https://okmorz.github.io/work1/` に自動デプロイされます（`Actions` タブから進捗を確認できます）。Secretsが未設定・不正な場合、ビルド自体は成功しますが公開されたアプリはSupabaseクライアントの初期化エラーで真っ白な画面になります。

## PWA（ホーム画面に追加して使う）

`npm run build` の成果物には Web App Manifest（`manifest.webmanifest`）と Service Worker（`sw.js`）が含まれ、スマートフォンやPCのブラウザから「ホーム画面に追加」「インストール」でアプリのように起動できます。

- **キャッシュ対象は静的ファイルのみ**: `sw.js` はJS/CSS/HTML/アイコンなどの同一オリジンのファイルだけをキャッシュし、Supabase（別オリジン）へのAPI/認証リクエストは一切キャッシュしません（`vite.config.ts` の `VitePWA` 設定に意図的に `runtimeCaching` を追加していません）。そのため、オフラインでも**アプリ自体は起動**しますが、Supabaseとの同期はオンライン時のみ動作します（データ自体は従来通り `localStorage` にあるためオフラインでも入力・閲覧は可能です）。
- **アイコン**: `public/icon-192.png` / `icon-512.png` / `icon-maskable-512.png` / `favicon-48.png`。差し替える場合はこのファイル名のまま置き換えれば `vite.config.ts` の設定はそのまま使えます。
- **動作確認方法**: 開発サーバー（`npm run dev`）ではPWA機能は無効化されているため、`npm run build && npm run preview` でビルド成果物を確認してください。
- Service Workerの更新方式は `autoUpdate`（新しいビルドが公開されると自動的に最新版へ更新されます）。

## 認証・同期の挙動

- ログインしていない状態で `/` 以下にアクセスすると `/login` にリダイレクトされます（Supabase Auth のEmail/Passwordでログイン・新規登録）。
- 支出・目標データはまず `localStorage` に即時反映され、その直後にSupabaseへも送信されます（作成・編集・削除のたび）。
- 加えて、アプリ起動時（マウント時）と、開いている間は1時間ごとに、Supabase側の最新データと `localStorage` を突き合わせて再同期します。
  - 突き合わせのルール: 一度も同期に成功していないローカルの変更（オフライン中の変更など）を優先し、それ以外は同期済みのリモート側を正として採用します（他端末での更新・削除を反映するため）。
- 通信エラー時は `localStorage` の内容をそのまま保持し、次回の同期タイミングで自動的に再試行します。ダッシュボード右上の同期状態インジケーターで、最終同期時刻や同期エラーを確認できます。
- ログアウト時は端末上のローカルデータを消去します（同じ端末を別アカウントで使う場合のデータ漏えい防止のため）。
- **注意**: ブラウザ/PWAはタブを閉じている間バックグラウンド処理を実行できないため、「1時間ごと」の自動再同期は「アプリを開いている間」のみ有効です。
- `.env` はリポジトリに含めません（`.gitignore` で除外）。GitHub Pagesへデプロイするとビルド成果物に `VITE_SUPABASE_URL` と `anon key` が含まれ公開される想定のため、アクセス制御はSupabaseのRow Level Security (RLS) で行います。

## ディレクトリ構成

```
src/
  main.tsx              # エントリーポイント（BrowserRouterでラップ）
  App.tsx               # ルーティング定義
  index.css             # Tailwind CSS の読み込み
  vite-env.d.ts         # Vite/環境変数の型定義
  types/                # ドメイン型（Expense, SavingsGoal）
  lib/                  # supabaseClient, localStorage操作, Supabase同期API, マージロジック, カテゴリ配色
  contexts/              # AuthContext（セッション）, DataContext（データ+同期の状態管理）
  utils/                # 日付計算・「使える金額」計算・月末フィードバック・支出分析(統計)ロジック
  pages/                # 画面単位のコンポーネント（ログイン/ダッシュボード/支出入力・一覧/目標設定/支出分析）
  components/
    auth/                # RequireAuth（未ログイン時のリダイレクト）
    layout/              # 共通レイアウト・ナビゲーション・ログアウト
    dashboard/           # 使える金額カード・カテゴリ別グラフ・月末フィードバック・同期状態インジケーター
    expense/             # 支出入力フォーム・一覧
    goal/                # 目標設定フォーム
    stats/               # 支出分析（月次推移・逸脱検知・前月比/前年同月比・曜日パターン・目標予測）
public/
  icon-*.png, favicon-48.png  # PWAアイコン
supabase/
  config.toml            # ローカルSupabase CLIの設定
  migrations/             # テーブル定義・RLSポリシーのSQL
scripts/                 # 将来的なPython拡張用（必須ではない）
```
