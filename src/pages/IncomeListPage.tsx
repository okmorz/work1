import { useMemo, useState } from 'react'
import { IncomeList } from '../components/income/IncomeList'
import { useData } from '../contexts/DataContext'
import { INCOME_CATEGORIES, type IncomeCategory } from '../types/income'
import { toMonthKey } from '../utils/date'
import { formatYen } from '../utils/format'

type CategoryFilter = IncomeCategory | 'all'

export function IncomeListPage() {
  const { incomes, deleteIncome } = useData()
  const [month, setMonth] = useState(() => toMonthKey(new Date()))
  const [category, setCategory] = useState<CategoryFilter>('all')

  const filtered = useMemo(
    () =>
      incomes.filter(
        (i) =>
          i.date.startsWith(month) &&
          (category === 'all' || i.category === category),
      ),
    [incomes, month, category],
  )

  const total = filtered.reduce((sum, i) => sum + i.amount, 0)

  function handleDelete(id: string) {
    if (window.confirm('この収入を削除しますか？')) {
      deleteIncome(id)
    }
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">収入一覧</h1>
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
            {INCOME_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <p className="ml-auto text-sm text-gray-600">
          合計{' '}
          <span className="font-semibold text-green-700">
            {formatYen(total)}
          </span>
        </p>
      </div>
      <IncomeList incomes={filtered} onDelete={handleDelete} />
    </div>
  )
}
