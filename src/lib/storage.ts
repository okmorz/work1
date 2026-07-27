import type { Expense } from '../types/expense'
import type { SavingsGoal } from '../types/savingsGoal'

const EXPENSES_KEY = 'kakeibo:expenses'
const SAVINGS_GOAL_KEY = 'kakeibo:savingsGoal'
const PENDING_DELETES_KEY = 'kakeibo:pendingDeletes'
const DISMISSED_FEEDBACK_MONTH_KEY = 'kakeibo:dismissedFeedbackMonth'

function readJson<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key)
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJson<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

export function loadExpenses(): Expense[] {
  return readJson<Expense[]>(EXPENSES_KEY, [])
}

export function saveExpenses(expenses: Expense[]): void {
  writeJson(EXPENSES_KEY, expenses)
}

export function loadSavingsGoal(): SavingsGoal | null {
  return readJson<SavingsGoal | null>(SAVINGS_GOAL_KEY, null)
}

export function saveSavingsGoal(goal: SavingsGoal): void {
  writeJson(SAVINGS_GOAL_KEY, goal)
}

/** Supabaseへの削除リクエストがまだ成功していない支出IDのトゥームストーン */
export function loadPendingDeletes(): string[] {
  return readJson<string[]>(PENDING_DELETES_KEY, [])
}

export function savePendingDeletes(ids: string[]): void {
  writeJson(PENDING_DELETES_KEY, ids)
}

/** 月末フィードバックを閉じた（確認済みの）最後の対象月 */
export function loadDismissedFeedbackMonth(): string | null {
  return readJson<string | null>(DISMISSED_FEEDBACK_MONTH_KEY, null)
}

export function saveDismissedFeedbackMonth(month: string): void {
  writeJson(DISMISSED_FEEDBACK_MONTH_KEY, month)
}

/** サインアウト時に呼び、端末を共有する次のユーザーへのデータ漏えいを防ぐ */
export function clearAllLocalData(): void {
  localStorage.removeItem(EXPENSES_KEY)
  localStorage.removeItem(SAVINGS_GOAL_KEY)
  localStorage.removeItem(PENDING_DELETES_KEY)
  localStorage.removeItem(DISMISSED_FEEDBACK_MONTH_KEY)
}
