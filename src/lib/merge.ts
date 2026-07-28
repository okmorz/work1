import type { SavingsGoal } from '../types/savingsGoal'

interface SyncedRecord {
  id: string
  syncedAt?: string
}

/**
 * ローカルとリモートの同期対象データ（支出・収入）を突き合わせる。
 * - まだリモートに送信できていないローカルの変更（syncedAt未設定）は優先して残す
 *   （送信直後にreconcileが走っても上書きされないようにするため）
 * - 過去に同期済みの項目はリモート側を正とする（他端末での更新・削除を反映するため）
 * - pendingDeleteIdsに含まれるものはローカル削除がまだリモートに反映されていないため除外する
 */
export function mergeSyncedRecords<T extends SyncedRecord>(
  local: T[],
  remote: T[],
  pendingDeleteIds: ReadonlySet<string>,
): T[] {
  const remoteById = new Map(remote.map((r) => [r.id, r]))
  const seen = new Set<string>()
  const result: T[] = []

  for (const item of local) {
    seen.add(item.id)
    if (pendingDeleteIds.has(item.id)) continue
    if (!item.syncedAt) {
      result.push(item)
      continue
    }
    const remoteMatch = remoteById.get(item.id)
    if (remoteMatch) result.push(remoteMatch)
  }

  for (const item of remote) {
    if (!seen.has(item.id) && !pendingDeleteIds.has(item.id)) {
      result.push(item)
    }
  }

  return result
}

export function resolveGoal(
  local: SavingsGoal | null,
  remote: SavingsGoal | null,
): SavingsGoal | null {
  if (local && !local.syncedAt) return local
  return remote ?? local
}
