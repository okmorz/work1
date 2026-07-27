import { useState } from 'react'
import {
  monthEndFeedbackTarget,
  monthlyBudgetSnapshot,
  nextMonthBudget,
} from '../../utils/calculations'
import { formatYen } from '../../utils/format'
import {
  loadDismissedFeedbackMonth,
  saveDismissedFeedbackMonth,
} from '../../lib/storage'
import type { Expense } from '../../types/expense'
import type { SavingsGoal } from '../../types/savingsGoal'

interface MonthEndFeedbackProps {
  goal: SavingsGoal
  expenses: Expense[]
}

function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-')
  return `${year}年${Number(month)}月`
}

export function MonthEndFeedback({ goal, expenses }: MonthEndFeedbackProps) {
  const [dismissedMonth, setDismissedMonth] = useState(() =>
    loadDismissedFeedbackMonth(),
  )

  const target = monthEndFeedbackTarget(goal)
  if (!target) return null
  if (!target.isPreview && dismissedMonth === target.targetMonth) return null

  const { spent, diff } = monthlyBudgetSnapshot(goal, expenses, target.targetMonth)
  const isOver = diff < 0
  const monthLabel = formatMonthLabel(target.targetMonth)
  const nextBudget = nextMonthBudget(goal, expenses, target.targetMonth)
  const goalPeriodEnded = target.targetMonth >= goal.endMonth

  function handleDismiss() {
    saveDismissedFeedbackMonth(target!.targetMonth)
    setDismissedMonth(target!.targetMonth)
  }

  return (
    <section
      className={`rounded-lg border p-5 shadow-sm ${
        isOver ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-sm font-semibold text-gray-700">
          {monthLabel}のまとめ{target.isPreview && '（本日は月末です）'}
        </h2>
        {!target.isPreview && (
          <button
            type="button"
            onClick={handleDismiss}
            className="shrink-0 text-xs text-gray-400 hover:text-gray-600"
          >
            閉じる
          </button>
        )}
      </div>

      <p className="mt-2 text-sm text-gray-700">
        実績: {formatYen(spent)}（目標との差:{' '}
        <span
          className={`font-semibold ${isOver ? 'text-red-600' : 'text-green-700'}`}
        >
          {isOver ? `${formatYen(-diff)} オーバー` : `${formatYen(diff)} 余裕あり`}
        </span>
        ）
      </p>

      <p className="mt-1 text-sm text-gray-700">
        {goalPeriodEnded ? (
          '目標期間が終了しました。お疲れ様でした！'
        ) : (
          <>
            来月あと使える金額:{' '}
            <span className="font-semibold">{formatYen(nextBudget)}</span>
          </>
        )}
      </p>

      <p className="mt-3 text-sm">
        {isOver
          ? '目標より使いすぎています。来月は少しペースを落としてみましょう。'
          : '順調に貯金できています。このペースを維持しましょう！'}
      </p>
    </section>
  )
}
