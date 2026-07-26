import type { Expense } from '../../types/expense'
import type { SavingsGoal } from '../../types/savingsGoal'
import { spendableThisMonth, spendableToday } from '../../utils/calculations'
import { formatYen } from '../../utils/format'

interface SpendableAmountCardProps {
  goal: SavingsGoal
  expenses: Expense[]
}

export function SpendableAmountCard({
  goal,
  expenses,
}: SpendableAmountCardProps) {
  const monthly = spendableThisMonth(goal, expenses)
  const daily = spendableToday(goal, expenses)

  return (
    <section className="rounded-lg bg-white p-6 text-center shadow-sm">
      <p className="text-sm text-gray-500">今月あと使える金額</p>
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
    </section>
  )
}
