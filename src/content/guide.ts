// 使い方ガイドページ（/guide）の文言。後から表現を直しやすいよう、
// コンポーネントに直書きせずここへ集約する。

/** 実際に公開されているアプリのURL。デプロイ先を変える場合はここを直す。 */
export const APP_URL = 'https://okmorz.github.io/work1/'

/**
 * public/ 配下のファイルへの絶対パスを組み立てる。
 * GitHub Pagesはサブパス（/work1/）配信のため、`base`（import.meta.env.BASE_URL）を
 * 前置しないと画像が404になる（index.html内の参照とは違い、Viteのビルド時パス変換が
 * 効かないため）。
 */
function publicAsset(path: string): string {
  return `${import.meta.env.BASE_URL}${path}`
}

export const APP_OVERVIEW =
  '年間の貯金目標から、毎月・毎日あといくら使えるかを教えてくれる家計簿アプリです。'

export const SIGNUP_STEPS: string[] = [
  '下の「アプリを開く」ボタンからログイン画面を開く',
  '「アカウントを作成する」をタップする',
  'メールアドレスとパスワード（6文字以上）を入力して「新規登録」をタップする',
  '登録が完了したら、同じ画面からログインする',
]

export interface PwaInstallGuide {
  platform: 'ios' | 'android'
  label: string
  browserNote: string
  steps: string[]
  screenshots: { src: string; alt: string }[]
}

export const PWA_INSTALL_GUIDES: PwaInstallGuide[] = [
  {
    platform: 'ios',
    label: 'iPhone / iPad',
    browserNote: 'Safariで開いてください（Chrome等では追加できません）',
    steps: [
      'Safariでアプリを開く',
      '画面下部の共有ボタン（四角から↑が出ているアイコン）をタップする',
      'メニューを下にスクロールし、「ホーム画面に追加」をタップする',
      '右上の「追加」をタップすると完了',
    ],
    screenshots: [
      { src: publicAsset('guide/ios-step1.png'), alt: 'iOS: 共有ボタンをタップ' },
      { src: publicAsset('guide/ios-step2.png'), alt: 'iOS: ホーム画面に追加をタップ' },
    ],
  },
  {
    platform: 'android',
    label: 'Android',
    browserNote: 'Chromeで開いてください',
    steps: [
      'Chromeでアプリを開く',
      '画面下部に「ホーム画面に追加」バナーが表示されたらタップする',
      '表示されない場合は、右上の「⋮」メニューから「アプリをインストール」を選ぶ',
      '「インストール」をタップすると完了',
    ],
    screenshots: [
      {
        src: publicAsset('guide/android-step1.png'),
        alt: 'Android: インストールバナー',
      },
      {
        src: publicAsset('guide/android-step2.png'),
        alt: 'Android: メニューからインストール',
      },
    ],
  },
]

export interface UsageStep {
  title: string
  description: string
}

export const USAGE_STEPS: UsageStep[] = [
  {
    title: '目標貯金額を設定する',
    description:
      '「目標設定」画面で、年間（または月間）の貯金目標額と期間を入力します。',
  },
  {
    title: '日々の支出を記録する',
    description:
      '買い物や外食などで支出があったら、「支出を記録」からすぐに入力しましょう。',
  },
  {
    title: 'ダッシュボードで確認する',
    description:
      'トップ画面で「今月・今日あといくら使えるか」がひと目で分かります。',
  },
  {
    title: '分析画面で傾向を確認する',
    description:
      '「支出分析」画面で、カテゴリ別の推移や普段との違いを確認できます。',
  },
]
