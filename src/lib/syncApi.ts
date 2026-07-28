import { supabase } from './supabaseClient'
import type { Category, Expense } from '../types/expense'
import type { Income, IncomeCategory } from '../types/income'
import type { SavingsGoal } from '../types/savingsGoal'

interface ExpenseRow {
  id: string
  date: string
  amount: number
  memo: string | null
  category: Category
  other_category_label: string | null
}

function rowToExpense(row: ExpenseRow): Expense {
  return {
    id: row.id,
    date: row.date,
    amount: row.amount,
    memo: row.memo ?? '',
    category: row.category,
    otherCategoryLabel: row.other_category_label ?? undefined,
    syncedAt: new Date().toISOString(),
  }
}

export async function fetchRemoteExpenses(userId: string): Promise<Expense[]> {
  const { data, error } = await supabase
    .from('expenses')
    .select('id, date, amount, memo, category, other_category_label')
    .eq('user_id', userId)
  if (error) throw error
  return (data ?? []).map(rowToExpense)
}

export async function upsertRemoteExpense(
  userId: string,
  expense: Expense,
): Promise<void> {
  const { error } = await supabase.from('expenses').upsert(
    {
      id: expense.id,
      user_id: userId,
      date: expense.date,
      amount: expense.amount,
      memo: expense.memo,
      category: expense.category,
      other_category_label: expense.otherCategoryLabel ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' },
  )
  if (error) throw error
}

export async function deleteRemoteExpense(id: string): Promise<void> {
  const { error } = await supabase.from('expenses').delete().eq('id', id)
  if (error) throw error
}

interface IncomeRow {
  id: string
  date: string
  amount: number
  memo: string | null
  category: IncomeCategory
}

function rowToIncome(row: IncomeRow): Income {
  return {
    id: row.id,
    date: row.date,
    amount: row.amount,
    memo: row.memo ?? '',
    category: row.category,
    syncedAt: new Date().toISOString(),
  }
}

export async function fetchRemoteIncomes(userId: string): Promise<Income[]> {
  const { data, error } = await supabase
    .from('incomes')
    .select('id, date, amount, memo, category')
    .eq('user_id', userId)
  if (error) throw error
  return (data ?? []).map(rowToIncome)
}

export async function upsertRemoteIncome(
  userId: string,
  income: Income,
): Promise<void> {
  const { error } = await supabase.from('incomes').upsert(
    {
      id: income.id,
      user_id: userId,
      date: income.date,
      amount: income.amount,
      memo: income.memo,
      category: income.category,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' },
  )
  if (error) throw error
}

export async function deleteRemoteIncome(id: string): Promise<void> {
  const { error } = await supabase.from('incomes').delete().eq('id', id)
  if (error) throw error
}

interface GoalRow {
  yearly_target_amount: number
  start_month: string
  end_month: string
}

function rowToGoal(row: GoalRow): SavingsGoal {
  return {
    yearlyTargetAmount: row.yearly_target_amount,
    startMonth: row.start_month,
    endMonth: row.end_month,
    syncedAt: new Date().toISOString(),
  }
}

export async function fetchRemoteGoal(
  userId: string,
): Promise<SavingsGoal | null> {
  const { data, error } = await supabase
    .from('savings_goals')
    .select('yearly_target_amount, start_month, end_month')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  return data ? rowToGoal(data) : null
}

export async function upsertRemoteGoal(
  userId: string,
  goal: SavingsGoal,
): Promise<void> {
  const { error } = await supabase.from('savings_goals').upsert(
    {
      user_id: userId,
      yearly_target_amount: goal.yearlyTargetAmount,
      start_month: goal.startMonth,
      end_month: goal.endMonth,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  )
  if (error) throw error
}
