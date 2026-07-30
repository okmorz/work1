import { useState } from 'react'
import { useData } from '../../contexts/DataContext'

export function ResetDataSection() {
  const { resetAllData } = useData()
  const [confirming, setConfirming] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function handleReset() {
    setResetting(true)
    setError(null)
    try {
      await resetAllData()
      setConfirming(false)
      setDone(true)
    } catch {
      setError('初期化に失敗しました。通信状況を確認して、もう一度お試しください。')
    } finally {
      setResetting(false)
    }
  }

  if (done) {
    return (
      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <p className="text-sm text-gray-600">
          データを初期化しました。目標・支出・収入はすべて削除されています。
        </p>
      </section>
    )
  }

  if (!confirming) {
    return (
      <section className="rounded-lg border border-red-200 bg-red-50 p-5">
        <h2 className="text-sm font-semibold text-red-700">データの初期化</h2>
        <p className="mt-1 text-sm text-red-600">
          目標金額・支出・収入など、これまでのデータをすべて削除します。この操作は元に戻せません。
        </p>
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="mt-3 rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          初期化する
        </button>
      </section>
    )
  }

  return (
    <section className="rounded-lg border border-red-300 bg-red-50 p-5">
      <p className="text-sm font-semibold text-red-700">
        本当にすべてのデータを削除しますか？この操作は元に戻せません。
      </p>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          disabled={resetting}
          onClick={() => void handleReset()}
          className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          {resetting ? '削除中…' : 'はい、削除する'}
        </button>
        <button
          type="button"
          disabled={resetting}
          onClick={() => setConfirming(false)}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
        >
          キャンセル
        </button>
      </div>
    </section>
  )
}
