import { useData } from '../../contexts/DataContext'

export function SyncStatusIndicator() {
  const { syncStatus, lastSyncedAt } = useData()

  if (syncStatus === 'error') {
    return (
      <p className="text-xs text-amber-600">
        同期に失敗しました（自動で再試行します。データは端末に保存されています）
      </p>
    )
  }

  if (syncStatus === 'syncing') {
    return <p className="text-xs text-gray-400">同期中…</p>
  }

  if (lastSyncedAt) {
    const time = new Date(lastSyncedAt).toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    })
    return <p className="text-xs text-gray-400">最終同期: {time}</p>
  }

  return <p className="text-xs text-gray-400">未同期</p>
}
