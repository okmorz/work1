import type { Expense } from '../../types/expense'
import type { Income } from '../../types/income'
import type { SavingsGoal } from '../../types/savingsGoal'
import { goalForecast } from '../../utils/analytics'
import { formatYen } from '../../utils/format'

interface GoalForecastCardProps {
  goal: SavingsGoal
  expenses: Expense[]
  incomes: Income[]
}

// dataviz skill status palette (fixed, never themed)
const STATUS_GOOD = '#0ca30c'
const STATUS_CRITICAL = '#d03b3b'

export function GoalForecastCard({
  goal,
  expenses,
  incomes,
}: GoalForecastCardProps) {
  const forecast = goalForecast(goal, expenses, incomes)

  if (!forecast) {
    return (
      <p className="rounded-lg bg-white p-4 text-sm text-gray-500 shadow-sm">
        目標期間の開始前です。
      </p>
    )
  }

  const statusColor = forecast.onTrack ? STATUS_GOOD : STATUS_CRITICAL
  const statusLabel = forecast.onTrack ? '順調' : '目標未達の見込み'
  const isNetSaving = forecast.projectedNetSpend < 0

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
        {forecast.isFinal
          ? 'このペースでの最終着地額（収入差し引き後）'
          : 'このペースが続いた場合の着地予測（収入差し引き後）'}
      </p>
      <p className="mt-1 text-2xl font-bold text-gray-900">
        {isNetSaving
          ? `${formatYen(-forecast.projectedNetSpend)} 貯金`
          : `${formatYen(forecast.projectedNetSpend)} 支出超過`}
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
