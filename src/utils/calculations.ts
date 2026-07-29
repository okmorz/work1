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

/** 実績貯金額（収入合計 − 支出合計）。正なら貯金できている、負なら赤字 */
export function netSavings(
  incomes: DatedAmount[],
  expenses: DatedAmount[],
  monthKey?: string,
): number {
  return totalAmount(incomes, monthKey) - totalAmount(expenses, monthKey)
}

/**
 * 確定済み実績貯金額 = 目標開始月から「対象月より前の完了済み月」までの（収入−支出）の合計。
 * 対象月自体のデータは含めない（対象月はこれから使う／進行中の月として別枠で扱うため）。
 */
export function confirmedSavings(
  goal: SavingsGoal,
  allExpenses: Expense[],
  allIncomes: Income[],
  targetMonth: string,
): number {
  const expensesBefore = allExpenses.filter(
    (e) => e.date.slice(0, 7) >= goal.startMonth && e.date.slice(0, 7) < targetMonth,
  )
  const incomesBefore = allIncomes.filter(
    (i) => i.date.slice(0, 7) >= goal.startMonth && i.date.slice(0, 7) < targetMonth,
  )
  return netSavings(incomesBefore, expensesBefore)
}

/**
 * targetMonthの月間貯金目標額 = 残り必要貯金額 ÷ 残り月数。
 * 目標金額を期間の途中で変更しても、確定済み実績貯金額と残り月数から都度算出し直す
 * （固定値として保存しないので、変更が次の表示から自動的に反映される）。
 */
export function monthlyBudgetTarget(
  goal: SavingsGoal,
  allExpenses: Expense[],
  allIncomes: Income[],
  targetMonth: string,
): number {
  const remainingMonths = remainingMonthsInclusive(targetMonth, goal.endMonth)
  if (remainingMonths <= 0) return 0
  const confirmed = confirmedSavings(goal, allExpenses, allIncomes, targetMonth)
  const remainingNeeded = goal.yearlyTargetAmount - confirmed
  return remainingNeeded / remainingMonths
}

/**
 * targetMonthの収入額として使う値。
 * その月の収入が1件でも記録されていれば実績合計を、無ければ目標の見込み月収を暫定的に使う。
 */
export function monthlyIncomeForBudget(
  goal: SavingsGoal,
  allIncomes: Income[],
  targetMonth: string,
): number {
  const monthIncomes = allIncomes.filter((i) => i.date.slice(0, 7) === targetMonth)
  if (monthIncomes.length > 0) return totalAmount(monthIncomes)
  return goal.estimatedMonthlyIncome
}

/** 今月あと使える金額（今月の収入額 − 月間貯金目標額 − 今月の支出合計） */
export function spendableThisMonth(
  goal: SavingsGoal,
  allExpenses: Expense[],
  allIncomes: Income[],
  today: Date = new Date(),
): number {
  const currentMonth = toMonthKey(today)
  const remainingMonths = remainingMonthsInclusive(currentMonth, goal.endMonth)
  if (remainingMonths <= 0) return 0

  const budgetTarget = monthlyBudgetTarget(goal, allExpenses, allIncomes, currentMonth)
  const monthlyIncome = monthlyIncomeForBudget(goal, allIncomes, currentMonth)
  const spentThisMonth = totalAmount(allExpenses, currentMonth)
  return monthlyIncome - budgetTarget - spentThisMonth
}

/** 今日あと使える金額（今月あと使える金額 ÷ 今月の残り日数） */
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
  /** targetMonthの月間貯金目標額 */
  budget: number
  /** targetMonthの実績貯金額（収入−支出、暫定値は使わない） */
  actualSavings: number
  /** actualSavings - budget（正なら目標達成/超過、負なら未達） */
  diff: number
}

/** targetMonth（確定済み月）の目標と実績を比較する。月末フィードバックで使用 */
export function monthlyBudgetSnapshot(
  goal: SavingsGoal,
  allExpenses: Expense[],
  allIncomes: Income[],
  targetMonth: string,
): MonthlyBudgetSnapshot {
  const budget = monthlyBudgetTarget(goal, allExpenses, allIncomes, targetMonth)
  const actualSavings = netSavings(allIncomes, allExpenses, targetMonth)
  return { budget, actualSavings, diff: actualSavings - budget }
}

/** targetMonthの実績まで踏まえた、翌月あと使える金額（翌月はまだ収入実績がないので見込み月収を使う） */
export function nextMonthBudget(
  goal: SavingsGoal,
  allExpenses: Expense[],
  allIncomes: Income[],
  targetMonth: string,
): number {
  const nextMonth = addMonths(targetMonth, 1)
  const remainingMonths = remainingMonthsInclusive(nextMonth, goal.endMonth)
  if (remainingMonths <= 0) return 0
  const budgetTarget = monthlyBudgetTarget(goal, allExpenses, allIncomes, nextMonth)
  const monthlyIncome = monthlyIncomeForBudget(goal, allIncomes, nextMonth)
  return monthlyIncome - budgetTarget
}

/** 目標開始月からこれまでの実績貯金額（収入合計 − 支出合計、暫定値は使わない） */
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
  return netSavings(incomesSinceStart, expensesSinceStart)
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
