import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  type PieLabelRenderProps,
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
  })).filter((d) => d.value > 0)

  if (data.length === 0) {
    return (
      <p className="rounded-lg bg-white p-4 text-sm text-gray-500 shadow-sm">
        今月はまだ支出が記録されていません。
      </p>
    )
  }

  return (
    <div className="rounded-lg bg-white p-4 shadow-sm" style={{ height: 340 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="category"
            cx="50%"
            cy="45%"
            outerRadius={95}
            labelLine={{ stroke: '#c3c2b7' }}
            label={(props: PieLabelRenderProps) =>
              `${props.name} ${Math.round((props.percent ?? 0) * 100)}%`
            }
          >
            {data.map((entry) => (
              <Cell
                key={entry.category}
                fill={CATEGORY_COLORS[entry.category]}
                stroke="#fff"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip formatter={(value) => formatYen(Number(value))} />
          <Legend
            verticalAlign="bottom"
            wrapperStyle={{ fontSize: 12, color: '#52514e' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
