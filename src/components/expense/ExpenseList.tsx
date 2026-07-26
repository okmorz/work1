import { Link } from 'react-router-dom'
import type { Expense } from '../../types/expense'
import { formatYen } from '../../utils/format'

interface ExpenseListProps {
  expenses: Expense[]
  onDelete: (id: string) => void
}

interface DateGroup {
  date: string
  items: Expense[]
  subtotal: number
}

function groupByDate(expenses: Expense[]): DateGroup[] {
  const sorted = [...expenses].sort((a, b) => b.date.localeCompare(a.date))
  const map = new Map<string, Expense[]>()
  for (const expense of sorted) {
    const items = map.get(expense.date) ?? []
    items.push(expense)
    map.set(expense.date, items)
  }
  return [...map.entries()].map(([date, items]) => ({
    date,
    items,
    subtotal: items.reduce((sum, item) => sum + item.amount, 0),
  }))
}

export function ExpenseList({ expenses, onDelete }: ExpenseListProps) {
  const groups = groupByDate(expenses)

  if (groups.length === 0) {
    return <p className="text-sm text-gray-500">該当する支出がありません。</p>
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
            {items.map((expense) => (
              <li
                key={expense.id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {expense.category === 'その他' && expense.otherCategoryLabel
                      ? `その他（${expense.otherCategoryLabel}）`
                      : expense.category}
                  </p>
                  {expense.memo && (
                    <p className="text-xs text-gray-500">{expense.memo}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-900">
                    {formatYen(expense.amount)}
                  </span>
                  <Link
                    to={`/expenses/${expense.id}/edit`}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    編集
                  </Link>
                  <button
                    type="button"
                    onClick={() => onDelete(expense.id)}
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
