import type { Expense } from '../../types/expense'
import { periodComparisons, type AmountComparison } from '../../utils/analytics'
import { formatYen } from '../../utils/format'

interface PeriodComparisonListProps {
  expenses: Expense[]
}

function ComparisonValue({ comparison }: { comparison: AmountComparison }) {
  if (comparison.reference === null || comparison.diff === null) {
    return <span className="text-gray-400">比較データなし</span>
  }
  const sign = comparison.diff > 0 ? '+' : comparison.diff < 0 ? '−' : '±'
  const colorClass =
    comparison.diff > 0
      ? 'text-red-600'
      : comparison.diff < 0
        ? 'text-green-700'
        : 'text-gray-500'
  return (
    <span className={colorClass}>
      {sign}
      {formatYen(Math.abs(comparison.diff))}
      {comparison.percentChange !== null &&
        ` (${sign}${Math.abs(comparison.percentChange).toFixed(0)}%)`}
    </span>
  )
}

export function PeriodComparisonList({ expenses }: PeriodComparisonListProps) {
  const { total, byCategory } = periodComparisons(expenses)

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-xs text-gray-500">
          <tr>
            <th className="px-4 py-2 text-left font-medium">カテゴリ</th>
            <th className="px-4 py-2 text-left font-medium">今月</th>
            <th className="px-4 py-2 text-left font-medium">前月比</th>
            <th className="px-4 py-2 text-left font-medium">前年同月比</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          <tr className="font-semibold text-gray-900">
            <td className="whitespace-nowrap px-4 py-2">合計</td>
            <td className="whitespace-nowrap px-4 py-2">
              {formatYen(total.monthOverMonth.current)}
            </td>
            <td className="whitespace-nowrap px-4 py-2">
              <ComparisonValue comparison={total.monthOverMonth} />
            </td>
            <td className="whitespace-nowrap px-4 py-2">
              <ComparisonValue comparison={total.yearOverYear} />
            </td>
          </tr>
          {byCategory.map((row) => (
            <tr key={row.category}>
              <td className="whitespace-nowrap px-4 py-2 text-gray-700">
                {row.category}
              </td>
              <td className="whitespace-nowrap px-4 py-2">
                {formatYen(row.monthOverMonth.current)}
              </td>
              <td className="whitespace-nowrap px-4 py-2">
                <ComparisonValue comparison={row.monthOverMonth} />
              </td>
              <td className="whitespace-nowrap px-4 py-2">
                <ComparisonValue comparison={row.yearOverYear} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
