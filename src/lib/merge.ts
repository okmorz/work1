import type { Expense } from '../types/expense'
import type { SavingsGoal } from '../types/savingsGoal'

/**
 * ローカルとリモートの支出データを突き合わせる。
 * - まだリモートに送信できていないローカルの変更（syncedAt未設定）は優先して残す
 *   （送信直後にreconcileが走っても上書きされないようにするため）
 * - 過去に同期済みの項目はリモート側を正とする（他端末での更新・削除を反映するため）
 * - pendingDeleteIdsに含まれるものはローカル削除がまだリモートに反映されていないため除外する
 */
export function mergeExpenses(
  local: Expense[],
  remote: Expense[],
  pendingDeleteIds: ReadonlySet<string>,
): Expense[] {
  const remoteById = new Map(remote.map((r) => [r.id, r]))
  const seen = new Set<string>()
  const result: Expense[] = []

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
