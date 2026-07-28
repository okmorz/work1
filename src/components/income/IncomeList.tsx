import { Link } from 'react-router-dom'
import type { Income } from '../../types/income'
import { formatYen } from '../../utils/format'

interface IncomeListProps {
  incomes: Income[]
  onDelete: (id: string) => void
}

interface DateGroup {
  date: string
  items: Income[]
  subtotal: number
}

function groupByDate(incomes: Income[]): DateGroup[] {
  const sorted = [...incomes].sort((a, b) => b.date.localeCompare(a.date))
  const map = new Map<string, Income[]>()
  for (const income of sorted) {
    const items = map.get(income.date) ?? []
    items.push(income)
    map.set(income.date, items)
  }
  return [...map.entries()].map(([date, items]) => ({
    date,
    items,
    subtotal: items.reduce((sum, item) => sum + item.amount, 0),
  }))
}

export function IncomeList({ incomes, onDelete }: IncomeListProps) {
  const groups = groupByDate(incomes)

  if (groups.length === 0) {
    return <p className="text-sm text-gray-500">該当する収入がありません。</p>
  }

  return (
    <div className="space-y-6">
      {groups.map(({ date, items, subtotal }) => (
        <div key={date}>
          <div className="mb-2 flex items-baseline justify-between">
            <h3 className="text-sm font-semibold text-gray-600">{date}</h3>
            <span className="text-sm text-gray-500">
              小計 {formatYen(subtotal)}
            </span>
          </div>
          <ul className="divide-y divide-gray-200 overflow-hidden rounded-md border border-gray-200 bg-white">
            {items.map((income) => (
              <li
                key={income.id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {income.category}
                  </p>
                  {income.memo && (
                    <p className="text-xs text-gray-500">{income.memo}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium text-green-700">
                    {formatYen(income.amount)}
                  </span>
                  <Link
                    to={`/income/${income.id}/edit`}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    編集
                  </Link>
                  <button
                    type="button"
                    onClick={() => onDelete(income.id)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    削除
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
