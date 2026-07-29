import { useState, type FormEvent } from 'react'
import type { SavingsGoal } from '../../types/savingsGoal'
import { addMonths, monthsBetweenInclusive, toMonthKey } from '../../utils/date'
import { formatYen } from '../../utils/format'

type InputMode = 'yearly' | 'monthly'

interface GoalFormProps {
  initialGoal: SavingsGoal | null
  onSubmit: (goal: SavingsGoal) => void
}

function defaultStartMonth(): string {
  return toMonthKey(new Date())
}

function defaultEndMonth(): string {
  return addMonths(defaultStartMonth(), 11)
}

export function GoalForm({ initialGoal, onSubmit }: GoalFormProps) {
  const [mode, setMode] = useState<InputMode>('yearly')
  const [startMonth, setStartMonth] = useState(
    initialGoal?.startMonth ?? defaultStartMonth(),
  )
  const [endMonth, setEndMonth] = useState(
    initialGoal?.endMonth ?? defaultEndMonth(),
  )
  const [amountInput, setAmountInput] = useState(
    initialGoal ? String(initialGoal.yearlyTargetAmount) : '',
  )
  const [estimatedMonthlyIncomeInput, setEstimatedMonthlyIncomeInput] = useState(
    initialGoal ? String(initialGoal.estimatedMonthlyIncome) : '',
  )

  const months = Math.max(1, monthsBetweenInclusive(startMonth, endMonth))
  const amount = Number(amountInput) || 0
  const yearlyTargetAmount = mode === 'yearly' ? amount : amount * months
  const monthlyAverage = Math.floor(yearlyTargetAmount / months)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (yearlyTargetAmount <= 0) return
    onSubmit({
      yearlyTargetAmount,
      startMonth,
      endMonth,
      estimatedMonthlyIncome: Number(estimatedMonthlyIncomeInput) || 0,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <span className="mb-2 block text-sm font-medium text-gray-700">
          目標金額の入力方法
        </span>
        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-1.5">
            <input
              type="radio"
              checked={mode === 'yearly'}
              onChange={() => setMode('yearly')}
            />
            年間で入力
          </label>
          <label className="flex items-center gap-1.5">
            <input
              type="radio"
              checked={mode === 'monthly'}
              onChange={() => setMode('monthly')}
            />
            月単位で入力
          </label>
        </div>
      </div>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-gray-700">
          {mode === 'yearly' ? '年間目標貯金額' : '月間目標貯金額'}
        </span>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          required
          value={amountInput}
          onChange={(e) => setAmountInput(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
          placeholder="例: 600000"
        />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-gray-700">
            開始月
          </span>
          <input
            type="month"
            required
            value={startMonth}
            onChange={(e) => setStartMonth(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-gray-700">
            終了月
          </span>
          <input
            type="month"
            required
            value={endMonth}
            onChange={(e) => setEndMonth(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-gray-700">
          月の平均収入（見込み）
        </span>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          required
          value={estimatedMonthlyIncomeInput}
          onChange={(e) => setEstimatedMonthlyIncomeInput(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
          placeholder="例: 250000"
        />
        <span className="mt-1 block text-xs text-gray-500">
          その月の収入をまだ記録していない間、この見込み額を暫定的に使って「使える金額」を計算します。収入を記録すると実績値に切り替わります。
        </span>
      </label>

      <p className="rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-700">
        期間 {months}ヶ月・年間目標 {formatYen(yearlyTargetAmount)}
        （月あたり平均 {formatYen(monthlyAverage)}）
      </p>

      <button
        type="submit"
        className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
      >
        目標を保存
      </button>
    </form>
  )
}
