import type { Expense } from '../types/expense'
import type { SavingsGoal } from '../types/savingsGoal'

const EXPENSES_KEY = 'kakeibo:expenses'
const SAVINGS_GOAL_KEY = 'kakeibo:savingsGoal'

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
