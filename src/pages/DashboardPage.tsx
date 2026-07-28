import { Link } from 'react-router-dom'
import { CategoryBreakdownChart } from '../components/dashboard/CategoryBreakdownChart'
import { MonthEndFeedback } from '../components/dashboard/MonthEndFeedback'
import { SpendableAmountCard } from '../components/dashboard/SpendableAmountCard'
import { SyncStatusIndicator } from '../components/dashboard/SyncStatusIndicator'
import { useData } from '../contexts/DataContext'
import { toMonthKey } from '../utils/date'

export function DashboardPage() {
  const { goal, expenses } = useData()

  if (!goal) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <Link to="/guide" className="text-xs text-gray-400 hover:underline">
            使い方はこちら
          </Link>
        </div>
        <div className="rounded-lg bg-white p-6 text-center shadow-sm">
          <p className="mb-4 text-sm text-gray-600">
            まだ貯金目標が設定されていません。
          </p>
          <Link
            to="/goal"
            className="inline-block rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
          >
            目標を設定する
          </Link>
        </div>
      </div>
    )
  }

  const currentMonth = toMonthKey(new Date())
  const expensesThisMonth = expenses.filter((e) => e.date.startsWith(currentMonth))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/guide" className="text-xs text-gray-400 hover:underline">
          使い方はこちら
        </Link>
        <SyncStatusIndicator />
      </div>
      <MonthEndFeedback goal={goal} expenses={expenses} />
      <SpendableAmountCard goal={goal} expenses={expenses} />
      <div>
        <h2 className="mb-2 text-sm font-semibold text-gray-600">
          今月のカテゴリ別支出
        </h2>
        <CategoryBreakdownChart expenses={expensesThisMonth} />
      </div>
    </div>
  )
}
