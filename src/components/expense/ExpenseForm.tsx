import { useState, type FormEvent } from 'react'
import { CATEGORIES, type Category, type Expense } from '../../types/expense'

interface ExpenseFormProps {
  initialExpense?: Expense
  onSubmit: (input: Omit<Expense, 'id' | 'syncedAt'>) => void
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

export function ExpenseForm({ initialExpense, onSubmit }: ExpenseFormProps) {
  const [date, setDate] = useState(initialExpense?.date ?? today())
  const [amountInput, setAmountInput] = useState(
    initialExpense ? String(initialExpense.amount) : '',
  )
  const [category, setCategory] = useState<Category>(
    initialExpense?.category ?? CATEGORIES[0],
  )
  const [memo, setMemo] = useState(initialExpense?.memo ?? '')
  const [otherCategoryLabel, setOtherCategoryLabel] = useState(
    initialExpense?.otherCategoryLabel ?? '',
  )

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const amount = Number(amountInput)
    if (!date || !amount) return
    onSubmit({
      date,
      amount,
      category,
      memo,
      otherCategoryLabel:
        category === 'その他' && otherCategoryLabel.trim()
          ? otherCategoryLabel.trim()
          : undefined,
    })
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
          placeholder="例: 1200"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-gray-700">
          カテゴリ
        </span>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      {category === 'その他' && (
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-gray-700">
            「その他」の内容（自由記述）
          </span>
          <input
            type="text"
            value={otherCategoryLabel}
            onChange={(e) => setOtherCategoryLabel(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
            placeholder="例: 医療費"
          />
        </label>
      )}

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
        className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
      >
        {initialExpense ? '更新する' : '記録する'}
      </button>
    </form>
  )
}
