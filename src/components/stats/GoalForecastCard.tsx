import type { Expense } from '../../types/expense'
import type { SavingsGoal } from '../../types/savingsGoal'
import { goalForecast } from '../../utils/analytics'
import { formatYen } from '../../utils/format'

interface GoalForecastCardProps {
  goal: SavingsGoal
  expenses: Expense[]
}

// dataviz skill status palette (fixed, never themed)
const STATUS_GOOD = '#0ca30c'
const STATUS_CRITICAL = '#d03b3b'

export function GoalForecastCard({ goal, expenses }: GoalForecastCardProps) {
  const forecast = goalForecast(goal, expenses)

  if (!forecast) {
    return (
      <p className="rounded-lg bg-white p-4 text-sm text-gray-500 shadow-sm">
        目標期間の開始前です。
      </p>
    )
  }

  const statusColor = forecast.onTrack ? STATUS_GOOD : STATUS_CRITICAL
  const statusLabel = forecast.onTrack ? '順調' : '目標未達の見込み'

  return (
    <section className="rounded-lg bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <span
          className="inline-block h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: statusColor }}
          aria-hidden="true"
        />
        <span className="text-sm font-semibold" style={{ color: statusColor }}>
          {statusLabel}
        </span>
      </div>
      <p className="mt-2 text-sm text-gray-600">
        {forecast.isFinal ? 'このペースでの最終着地額' : 'このペースが続いた場合の着地予測'}
      </p>
      <p className="mt-1 text-2xl font-bold text-gray-900">
        {formatYen(forecast.projectedTotalSpend)}
      </p>
      <p className="mt-2 text-sm text-gray-600">
        目標 {formatYen(forecast.yearlyTargetAmount)} との差:{' '}
        <span className="font-semibold" style={{ color: statusColor }}>
          {forecast.projectedSurplus >= 0
            ? `${formatYen(forecast.projectedSurplus)} 余裕あり`
            : `${formatYen(-forecast.projectedSurplus)} オーバーの見込み`}
        </span>
      </p>
    </section>
  )
}
