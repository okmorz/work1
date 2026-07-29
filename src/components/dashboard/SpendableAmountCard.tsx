import type { Expense } from '../../types/expense'
import type { Income } from '../../types/income'
import type { SavingsGoal } from '../../types/savingsGoal'
import {
  actualSavingsSoFar,
  monthlyIncomeForBudget,
  spendableThisMonth,
  spendableToday,
  totalAmount,
} from '../../utils/calculations'
import { toMonthKey } from '../../utils/date'
import { formatYen } from '../../utils/format'

interface SpendableAmountCardProps {
  goal: SavingsGoal
  expenses: Expense[]
  incomes: Income[]
}

export function SpendableAmountCard({
  goal,
  expenses,
  incomes,
}: SpendableAmountCardProps) {
  const currentMonth = toMonthKey(new Date())
  const monthly = spendableThisMonth(goal, expenses, incomes)
  const daily = spendableToday(goal, expenses, incomes)
  const savings = actualSavingsSoFar(goal, expenses, incomes)
  const progressRatio =
    goal.yearlyTargetAmount > 0 ? savings / goal.yearlyTargetAmount : 0
  const progressPercent = Math.round(progressRatio * 100)
  const progressBarWidth = Math.max(0, Math.min(100, progressPercent))

  const monthIncomeActual = totalAmount(incomes, currentMonth)
  const monthIncomeUsed = monthlyIncomeForBudget(goal, incomes, currentMonth)
  const isIncomeEstimated = monthIncomeActual === 0 && monthIncomeUsed > 0

  return (
    <section className="rounded-lg bg-white p-6 text-center shadow-sm">
      <p className="text-sm text-gray-500">
        今月の収入合計
        {isIncomeEstimated && (
          <span className="ml-1 text-xs text-gray-400">（見込み額）</span>
        )}
      </p>
      <p className="text-lg font-semibold text-gray-700">
        {formatYen(monthIncomeUsed)}
      </p>

      <p className="mt-4 text-sm text-gray-500">今月あと使える金額</p>
      <p
        className={`text-3xl font-bold ${monthly < 0 ? 'text-red-600' : 'text-blue-600'}`}
      >
        {formatYen(monthly)}
      </p>
      <p className="mt-4 text-sm text-gray-500">今日あと使える金額</p>
      <p
        className={`text-2xl font-bold ${daily < 0 ? 'text-red-600' : 'text-blue-600'}`}
      >
        {formatYen(daily)}
      </p>

      <div className="mt-6 border-t border-gray-100 pt-4 text-left">
        <div className="flex items-baseline justify-between">
          <p className="text-sm text-gray-500">貯金の進み具合（収入−支出）</p>
          <p
            className={`text-sm font-semibold ${savings < 0 ? 'text-red-600' : 'text-green-700'}`}
          >
            {progressPercent}%
          </p>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className={`h-full rounded-full ${savings < 0 ? 'bg-red-400' : 'bg-green-500'}`}
            style={{ width: `${progressBarWidth}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-gray-600">
          {formatYen(savings)} / 目標 {formatYen(goal.yearlyTargetAmount)}
        </p>
      </div>
    </section>
  )
}
