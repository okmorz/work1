import type { ReactNode } from 'react'
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { CATEGORY_COLORS } from '../../lib/categoryColors'
import { CATEGORIES, type Expense } from '../../types/expense'
import { formatYen } from '../../utils/format'

interface CategoryBreakdownChartProps {
  expenses: Expense[]
}

export function CategoryBreakdownChart({
  expenses,
}: CategoryBreakdownChartProps) {
  const data = CATEGORIES.map((category) => ({
    category,
    value: expenses
      .filter((e) => e.category === category)
      .reduce((sum, e) => sum + e.amount, 0),
  }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value)

  if (data.length === 0) {
    return (
      <p className="rounded-lg bg-white p-4 text-sm text-gray-500 shadow-sm">
        今月はまだ支出が記録されていません。
      </p>
    )
  }

  return (
    <div
      className="rounded-lg bg-white p-4 shadow-sm"
      style={{ height: 40 * data.length + 40 }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          barCategoryGap="30%"
          margin={{ top: 4, right: 56, bottom: 4, left: 8 }}
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="category"
            width={64}
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#52514e', fontSize: 13 }}
          />
          <Tooltip formatter={(value) => formatYen(Number(value))} />
          <Bar dataKey="value" barSize={20} radius={[0, 4, 4, 0]}>
            {data.map((entry) => (
              <Cell key={entry.category} fill={CATEGORY_COLORS[entry.category]} />
            ))}
            <LabelList
              dataKey="value"
              position="right"
              formatter={(value: ReactNode) => formatYen(Number(value))}
              fill="#52514e"
              fontSize={12}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
