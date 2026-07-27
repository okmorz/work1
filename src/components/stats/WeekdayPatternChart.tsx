import type { ReactNode } from 'react'
import {
  Bar,
  BarChart,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { Expense } from '../../types/expense'
import { weekdaySpendingPattern, weekdayWeekendInsight } from '../../utils/analytics'
import { formatYen } from '../../utils/format'

interface WeekdayPatternChartProps {
  expenses: Expense[]
}

// dataviz skill: single-hue sequential blue — bars are a magnitude comparison
// across an ordinal axis (weekday), not distinct identities, so one hue is correct.
const SEQUENTIAL_BLUE = '#2a78d6'

export function WeekdayPatternChart({ expenses }: WeekdayPatternChartProps) {
  const pattern = weekdaySpendingPattern(expenses)
  const insight = weekdayWeekendInsight(expenses)
  const hasData = pattern.some((p) => p.total > 0)

  if (!hasData) {
    return (
      <p className="rounded-lg bg-white p-4 text-sm text-gray-500 shadow-sm">
        まだ支出データがありません。
      </p>
    )
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg bg-white p-4 shadow-sm" style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={pattern} margin={{ top: 20, right: 8, bottom: 0, left: 8 }}>
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={{ stroke: '#c3c2b7' }}
              tick={{ fill: '#52514e', fontSize: 13 }}
            />
            <YAxis hide />
            <Tooltip formatter={(value) => formatYen(Number(value))} />
            <Bar dataKey="total" fill={SEQUENTIAL_BLUE} radius={[4, 4, 0, 0]} barSize={28}>
              <LabelList
                dataKey="total"
                position="top"
                formatter={(value: ReactNode) => formatYen(Number(value))}
                fill="#52514e"
                fontSize={11}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {insight && (
        <p className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800 shadow-sm">
          {insight.direction === 'weekend'
            ? `週末（土日）に「${insight.category}」の支出が集中する傾向があります（全体の${Math.round(insight.weekendShare * 100)}%が週末に発生）。`
            : `平日に「${insight.category}」の支出が集中する傾向があります（週末は全体の${Math.round(insight.weekendShare * 100)}%のみ）。`}
        </p>
      )}
    </div>
  )
}
