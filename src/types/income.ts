export type IncomeCategory = '給与' | '副業' | '臨時収入' | 'その他'

export const INCOME_CATEGORIES: IncomeCategory[] = ['給与', '副業', '臨時収入', 'その他']

export interface Income {
  id: string
  date: string // YYYY-MM-DD
  amount: number
  memo: string
  category: IncomeCategory
  syncedAt?: string
}
