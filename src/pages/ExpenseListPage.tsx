import { useMemo, useState } from 'react'
import { ExpenseList } from '../components/expense/ExpenseList'
import { useData } from '../contexts/DataContext'
import { CATEGORIES, type Category } from '../types/expense'
import { toMonthKey } from '../utils/date'
import { formatYen } from '../utils/format'

type CategoryFilter = Category | 'all'

export function ExpenseListPage() {
  const { expenses, deleteExpense } = useData()
  const [month, setMonth] = useState(() => toMonthKey(new Date()))
  const [category, setCategory] = useState<CategoryFilter>('all')

  const filtered = useMemo(
    () =>
      expenses.filter(
        (e) =>
          e.date.startsWith(month) &&
          (category === 'all' || e.category === category),
      ),
    [expenses, month, category],
  )

  const total = filtered.reduce((sum, e) => sum + e.amount, 0)

  function handleDelete(id: string) {
    if (window.confirm('この支出を削除しますか？')) {
      deleteExpense(id)
    }
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">支出一覧</h1>
      <div className="mb-4 flex flex-wrap items-end gap-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-gray-700">
            月
          </span>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-gray-700">
            カテゴリ
          </span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as CategoryFilter)}
            className="rounded-md border border-gray-300 px-3 py-2"
          >
            <option value="all">すべて</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <p className="ml-auto text-sm text-gray-600">
          合計{' '}
          <span className="font-semibold text-gray-900">
            {formatYen(total)}
          </span>
        </p>
      </div>
      <ExpenseList expenses={filtered} onDelete={handleDelete} />
    </div>
  )
}
