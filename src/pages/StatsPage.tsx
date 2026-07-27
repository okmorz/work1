import { Link } from 'react-router-dom'
import { CategoryMonthlyTrendChart } from '../components/stats/CategoryMonthlyTrendChart'
import { DeviationInsights } from '../components/stats/DeviationInsights'
import { GoalForecastCard } from '../components/stats/GoalForecastCard'
import { PeriodComparisonList } from '../components/stats/PeriodComparisonList'
import { WeekdayPatternChart } from '../components/stats/WeekdayPatternChart'
import { useData } from '../contexts/DataContext'

export function StatsPage() {
  const { goal, expenses } = useData()

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold">支出分析</h1>

      {goal ? (
        <section>
          <h2 className="mb-2 text-sm font-semibold text-gray-600">
            目標達成予測
          </h2>
          <GoalForecastCard goal={goal} expenses={expenses} />
        </section>
      ) : (
        <p className="rounded-lg bg-white p-6 text-center text-sm text-gray-600 shadow-sm">
          目標達成予測を見るには、まず
          <Link to="/goal" className="text-blue-600 hover:underline">
            目標を設定
          </Link>
          してください。
        </p>
      )}

      <section>
        <h2 className="mb-2 text-sm font-semibold text-gray-600">
          今月、普段と違う支出（平均 ± 標準偏差との比較）
        </h2>
        <DeviationInsights expenses={expenses} />
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-gray-600">
          前月比・前年同月比
        </h2>
        <PeriodComparisonList expenses={expenses} />
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-gray-600">
          カテゴリ別の月次推移（直近6ヶ月）
        </h2>
        <CategoryMonthlyTrendChart expenses={expenses} />
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-gray-600">
          曜日別の支出パターン
        </h2>
        <WeekdayPatternChart expenses={expenses} />
      </section>
    </div>
  )
}
