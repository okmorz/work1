import type { Expense } from '../types/expense'
import type { SavingsGoal } from '../types/savingsGoal'
import {
  addMonths,
  isLastDayOfMonth,
  remainingDaysInMonth,
  remainingMonthsInclusive,
  toMonthKey,
} from './date'

export function totalSpent(expenses: Expense[], monthKey?: string): number {
  return expenses
    .filter((e) => !monthKey || e.date.startsWith(monthKey))
    .reduce((sum, e) => sum + e.amount, 0)
}

/** 残り期間で使える総額（年間目標貯金額 − これまでの支出合計） */
export function remainingBudgetTotal(
  goal: SavingsGoal,
  expensesSinceStart: Expense[],
): number {
  return goal.yearlyTargetAmount - totalSpent(expensesSinceStart)
}

/** 今月あと使える金額 */
export function spendableThisMonth(
  goal: SavingsGoal,
  allExpenses: Expense[],
  today: Date = new Date(),
): number {
  const currentMonth = toMonthKey(today)
  const remainingMonths = remainingMonthsInclusive(currentMonth, goal.endMonth)
  if (remainingMonths <= 0) return 0

  const expensesSinceStart = allExpenses.filter(
    (e) => e.date.slice(0, 7) >= goal.startMonth,
  )
  const remainingTotal = remainingBudgetTotal(goal, expensesSinceStart)
  const perMonthBudget = remainingTotal / remainingMonths
  const spentThisMonth = totalSpent(allExpenses, currentMonth)
  return perMonthBudget - spentThisMonth
}

/** 今日あと使える金額（今月の残り使える額 ÷ 今月の残り日数） */
export function spendableToday(
  goal: SavingsGoal,
  allExpenses: Expense[],
  today: Date = new Date(),
): number {
  const currentMonth = toMonthKey(today)
  const remaining = remainingDaysInMonth(currentMonth, today)
  if (remaining <= 0) return 0
  return spendableThisMonth(goal, allExpenses, today) / remaining
}

export interface MonthlyBudgetSnapshot {
  /** targetMonth開始時点で使えるはずだった月間予算 */
  budget: number
  /** targetMonthに実際に使った金額 */
  spent: number
  /** budget - spent（正なら余裕あり、負なら使いすぎ） */
  diff: number
}

/** targetMonth開始時点の実績を、その時点までの支出だけを使って再現する */
export function monthlyBudgetSnapshot(
  goal: SavingsGoal,
  allExpenses: Expense[],
  targetMonth: string,
): MonthlyBudgetSnapshot {
  const expensesThroughTargetMonth = allExpenses.filter(
    (e) =>
      e.date.slice(0, 7) >= goal.startMonth && e.date.slice(0, 7) <= targetMonth,
  )
  const spentBeforeTargetMonth = totalSpent(
    expensesThroughTargetMonth.filter((e) => e.date.slice(0, 7) < targetMonth),
  )
  const remainingMonths = remainingMonthsInclusive(targetMonth, goal.endMonth)
  const budget =
    remainingMonths > 0
      ? (goal.yearlyTargetAmount - spentBeforeTargetMonth) / remainingMonths
      : 0
  const spent = totalSpent(expensesThroughTargetMonth, targetMonth)
  return { budget, spent, diff: budget - spent }
}

/** targetMonthの支出まで踏まえた、翌月あと使える金額 */
export function nextMonthBudget(
  goal: SavingsGoal,
  allExpenses: Expense[],
  targetMonth: string,
): number {
  const nextMonth = addMonths(targetMonth, 1)
  const remainingMonths = remainingMonthsInclusive(nextMonth, goal.endMonth)
  if (remainingMonths <= 0) return 0
  const spentThroughTargetMonth = totalSpent(
    allExpenses.filter(
      (e) =>
        e.date.slice(0, 7) >= goal.startMonth &&
        e.date.slice(0, 7) <= targetMonth,
    ),
  )
  return (goal.yearlyTargetAmount - spentThroughTargetMonth) / remainingMonths
}

export interface MonthEndFeedbackTarget {
  targetMonth: string
  /** true: 対象月がまだ進行中（月末当日のプレビュー）、false: 対象月は終了済み（先月の振り返り） */
  isPreview: boolean
}

/**
 * 月末フィードバックを表示すべき対象月を決める。
 * - 今日が月末なら、進行中の今月をプレビュー表示
 * - それ以外の日なら、先月を振り返りとして表示（対象は目標期間内のみ）
 */
export function monthEndFeedbackTarget(
  goal: SavingsGoal,
  today: Date = new Date(),
): MonthEndFeedbackTarget | null {
  const currentMonth = toMonthKey(today)

  if (isLastDayOfMonth(today)) {
    if (currentMonth >= goal.startMonth && currentMonth <= goal.endMonth) {
      return { targetMonth: currentMonth, isPreview: true }
    }
    return null
  }

  const previousMonth = addMonths(currentMonth, -1)
  if (previousMonth >= goal.startMonth && previousMonth <= goal.endMonth) {
    return { targetMonth: previousMonth, isPreview: false }
  }
  return null
}
