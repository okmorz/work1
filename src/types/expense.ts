export type Category =
  | '食費'
  | '生活費'
  | '趣味'
  | '外食費'
  | '衣類'
  | 'その他'

export const CATEGORIES: Category[] = [
  '食費',
  '生活費',
  '趣味',
  '外食費',
  '衣類',
  'その他',
]

export interface Expense {
  id: string
  date: string // YYYY-MM-DD
  amount: number
  memo: string
  category: Category
  syncedAt?: string
}
