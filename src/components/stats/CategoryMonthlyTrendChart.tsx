import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { CATEGORY_COLORS } from '../../lib/categoryColors'
import { CATEGORIES, type Expense } from '../../types/expense'
import { categoryMonthlyTrend } from '../../utils/analytics'
import { formatYen } from '../../utils/format'

interface CategoryMonthlyTrendChartProps {
  expenses: Expense[]
  monthsCount?: number
}

function formatMonthTick(month: string): string {
  const [, m] = month.split('-')
  return `${Number(m)}月`
}

export function CategoryMonthlyTrendChart({
  expenses,
  monthsCount = 6,
}: CategoryMonthlyTrendChartProps) {
  const trend = categoryMonthlyTrend(expenses, monthsCount)
  const hasAnyData = trend.some((point) => point.total > 0)

  if (!hasAnyData) {
    return (
      <p className="rounded-lg bg-white p-4 text-sm text-gray-500 shadow-sm">
        まだ支出データがありません。
      </p>
    )
  }

  const data = trend.map((point) => ({ month: point.month, ...point.amounts }))

  return (
    <div className="rounded-lg bg-white p-4 shadow-sm" style={{ height: 320 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
          <CartesianGrid vertical={false} stroke="#e1e0d9" />
          <XAxis
            dataKey="month"
            tickFormatter={formatMonthTick}
            tickLine={false}
            axisLine={{ stroke: '#c3c2b7' }}
            tick={{ fill: '#898781', fontSize: 12 }}
          />
          <YAxis
            tickFormatter={(value) => formatYen(Number(value))}
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#898781', fontSize: 11 }}
            width={72}
          />
          <Tooltip formatter={(value) => formatYen(Number(value))} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {CATEGORIES.map((category) => (
            <Bar
              key={category}
              dataKey={category}
              stackId="total"
              fill={CATEGORY_COLORS[category]}
              stroke="#fff"
              strokeWidth={2}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
