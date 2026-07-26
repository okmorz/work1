import type { Expense } from '../types/expense'
import type { SavingsGoal } from '../types/savingsGoal'
import { remainingDaysInMonth, remainingMonthsInclusive, toMonthKey } from './date'

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

  const remainingTotal = remainingBudgetTotal(goal, allExpenses)
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
