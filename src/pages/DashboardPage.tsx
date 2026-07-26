export function DashboardPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-lg bg-white p-6 text-center shadow-sm">
        <p className="text-sm text-gray-500">今月あと使える金額</p>
        <p className="text-3xl font-bold text-blue-600">-- 円</p>
        <p className="mt-4 text-sm text-gray-500">今日あと使える金額</p>
        <p className="text-2xl font-bold text-blue-600">-- 円</p>
      </section>
      {/* TODO: カテゴリ別支出グラフ */}
      {/* TODO: 月末フィードバックメッセージ */}
      {/* TODO: 同期状態インジケーター */}
    </div>
  )
}
