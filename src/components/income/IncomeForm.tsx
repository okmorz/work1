import { useState, type FormEvent } from 'react'
import { INCOME_CATEGORIES, type Income, type IncomeCategory } from '../../types/income'
import { toISODate } from '../../utils/date'

interface IncomeFormProps {
  initialIncome?: Income
  onSubmit: (input: Omit<Income, 'id' | 'syncedAt'>) => void
}

export function IncomeForm({ initialIncome, onSubmit }: IncomeFormProps) {
  const [date, setDate] = useState(initialIncome?.date ?? toISODate(new Date()))
  const [amountInput, setAmountInput] = useState(
    initialIncome ? String(initialIncome.amount) : '',
  )
  const [category, setCategory] = useState<IncomeCategory>(
    initialIncome?.category ?? INCOME_CATEGORIES[0],
  )
  const [memo, setMemo] = useState(initialIncome?.memo ?? '')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const amount = Number(amountInput)
    if (!date || !amount) return
    onSubmit({ date, amount, category, memo })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-gray-700">
          日付
        </span>
        <input
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-gray-700">
          金額
        </span>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          required
          value={amountInput}
          onChange={(e) => setAmountInput(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
          placeholder="例: 250000"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-gray-700">
          カテゴリ
        </span>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as IncomeCategory)}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
        >
          {INCOME_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-gray-700">
          メモ
        </span>
        <input
          type="text"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
          placeholder="任意"
        />
      </label>

      <button
        type="submit"
        className="w-full rounded-md bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700"
      >
        {initialIncome ? '更新する' : '記録する'}
      </button>
    </form>
  )
}
