import type { Expense } from '../../types/expense'
import { categoryDeviationAnalysis } from '../../utils/analytics'
import { formatYen } from '../../utils/format'

interface DeviationInsightsProps {
  expenses: Expense[]
}

export function DeviationInsights({ expenses }: DeviationInsightsProps) {
  const analysis = categoryDeviationAnalysis(expenses)

  if (analysis.status === 'insufficientData') {
    const remaining = analysis.requiredMonths - analysis.activeMonths
    return (
      <p className="rounded-lg bg-white p-4 text-sm text-gray-500 shadow-sm">
        データが揃うまでもう少しお待ちください（あと{remaining}ヶ月分の実績が必要です）。
      </p>
    )
  }

  if (analysis.insights.length === 0) {
    return (
      <p className="rounded-lg bg-white p-4 text-sm text-gray-600 shadow-sm">
        今月はどのカテゴリも普段どおりの範囲内です。
      </p>
    )
  }

  return (
    <ul className="space-y-2">
      {analysis.insights.map((insight) => (
        <li
          key={insight.category}
          className={`rounded-lg p-4 text-sm shadow-sm ${
            insight.direction === 'high'
              ? 'bg-amber-50 text-amber-800'
              : 'bg-blue-50 text-blue-800'
          }`}
        >
          今月は{insight.category}が普段より
          {insight.direction === 'high' ? '多め' : '少なめ'}です（平均{' '}
          {formatYen(insight.average)} → 今月 {formatYen(insight.currentAmount)}）
        </li>
      ))}
    </ul>
  )
}
