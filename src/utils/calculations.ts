import type { Expense } from '../types/expense'
import type { Income } from '../types/income'
import type { SavingsGoal } from '../types/savingsGoal'
import {
  addMonths,
  isLastDayOfMonth,
  remainingDaysInMonth,
  remainingMonthsInclusive,
  toMonthKey,
} from './date'

interface DatedAmount {
  date: string
  amount: number
}

export function totalAmount(records: DatedAmount[], monthKey?: string): number {
  return records
    .filter((r) => !monthKey || r.date.startsWith(monthKey))
    .reduce((sum, r) => sum + r.amount, 0)
}

/** 純支出（支出合計 − 収入合計）。正なら使った分が収入より多い、負なら貯金できている */
export function netSpent(
  expenses: DatedAmount[],
  incomes: DatedAmount[],
  monthKey?: string,
): number {
  return totalAmount(expenses, monthKey) - totalAmount(incomes, monthKey)
}

/** 残り期間で使える総額（年間目標貯金額 − これまでの純支出） */
export function remainingBudgetTotal(
  goal: SavingsGoal,
  expensesSinceStart: Expense[],
  incomesSinceStart: Income[],
): number {
  return goal.yearlyTargetAmount - netSpent(expensesSinceStart, incomesSinceStart)
}

/** 今月あと使える金額（収入が入るとその分増える） */
export function spendableThisMonth(
  goal: SavingsGoal,
  allExpenses: Expense[],
  allIncomes: Income[],
  today: Date = new Date(),
): number {
  const currentMonth = toMonthKey(today)
  const remainingMonths = remainingMonthsInclusive(currentMonth, goal.endMonth)
  if (remainingMonths <= 0) return 0

  const expensesSinceStart = allExpenses.filter(
    (e) => e.date.slice(0, 7) >= goal.startMonth,
  )
  const incomesSinceStart = allIncomes.filter(
    (i) => i.date.slice(0, 7) >= goal.startMonth,
  )
  const remainingTotal = remainingBudgetTotal(
    goal,
    expensesSinceStart,
    incomesSinceStart,
  )
  const perMonthBudget = remainingTotal / remainingMonths
  const netSpentThisMonth = netSpent(allExpenses, allIncomes, currentMonth)
  return perMonthBudget - netSpentThisMonth
}

/** 今日あと使える金額（今月の残り使える額 ÷ 今月の残り日数） */
export function spendableToday(
  goal: SavingsGoal,
  allExpenses: Expense[],
  allIncomes: Income[],
  today: Date = new Date(),
): number {
  const currentMonth = toMonthKey(today)
  const remaining = remainingDaysInMonth(currentMonth, today)
  if (remaining <= 0) return 0
  return spendableThisMonth(goal, allExpenses, allIncomes, today) / remaining
}

export interface MonthlyBudgetSnapshot {
  /** targetMonth開始時点で使えるはずだった月間予算 */
  budget: number
  /** targetMonthの純支出（支出−収入。負なら収入の方が多く貯金できている） */
  spent: number
  /** budget - spent（正なら余裕あり、負なら使いすぎ） */
  diff: number
}

/** targetMonth開始時点の実績を、その時点までの支出・収入だけを使って再現する */
export function monthlyBudgetSnapshot(
  goal: SavingsGoal,
  allExpenses: Expense[],
  allIncomes: Income[],
  targetMonth: string,
): MonthlyBudgetSnapshot {
  const expensesThroughTargetMonth = allExpenses.filter(
    (e) =>
      e.date.slice(0, 7) >= goal.startMonth && e.date.slice(0, 7) <= targetMonth,
  )
  const incomesThroughTargetMonth = allIncomes.filter(
    (i) =>
      i.date.slice(0, 7) >= goal.startMonth && i.date.slice(0, 7) <= targetMonth,
  )
  const netBeforeTargetMonth = netSpent(
    expensesThroughTargetMonth.filter((e) => e.date.slice(0, 7) < targetMonth),
    incomesThroughTargetMonth.filter((i) => i.date.slice(0, 7) < targetMonth),
  )
  const remainingMonths = remainingMonthsInclusive(targetMonth, goal.endMonth)
  const budget =
    remainingMonths > 0
      ? (goal.yearlyTargetAmount - netBeforeTargetMonth) / remainingMonths
      : 0
  const spent = netSpent(
    expensesThroughTargetMonth,
    incomesThroughTargetMonth,
    targetMonth,
  )
  return { budget, spent, diff: budget - spent }
}

/** targetMonthの支出・収入まで踏まえた、翌月あと使える金額 */
export function nextMonthBudget(
  goal: SavingsGoal,
  allExpenses: Expense[],
  allIncomes: Income[],
  targetMonth: string,
): number {
  const nextMonth = addMonths(targetMonth, 1)
  const remainingMonths = remainingMonthsInclusive(nextMonth, goal.endMonth)
  if (remainingMonths <= 0) return 0
  const netThroughTargetMonth = netSpent(
    allExpenses.filter(
      (e) =>
        e.date.slice(0, 7) >= goal.startMonth &&
        e.date.slice(0, 7) <= targetMonth,
    ),
    allIncomes.filter(
      (i) =>
        i.date.slice(0, 7) >= goal.startMonth &&
        i.date.slice(0, 7) <= targetMonth,
    ),
  )
  return (goal.yearlyTargetAmount - netThroughTargetMonth) / remainingMonths
}

/** 目標開始月からこれまでの実際の貯金額（収入合計 − 支出合計）。正なら貯金できている */
export function actualSavingsSoFar(
  goal: SavingsGoal,
  allExpenses: Expense[],
  allIncomes: Income[],
): number {
  const expensesSinceStart = allExpenses.filter(
    (e) => e.date.slice(0, 7) >= goal.startMonth,
  )
  const incomesSinceStart = allIncomes.filter(
    (i) => i.date.slice(0, 7) >= goal.startMonth,
  )
  return -netSpent(expensesSinceStart, incomesSinceStart)
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
