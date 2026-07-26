import { useState } from 'react'
import { loadExpenses, saveExpenses } from '../lib/storage'
import type { Expense } from '../types/expense'

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>(() => loadExpenses())

  function addExpense(input: Omit<Expense, 'id'>) {
    const expense: Expense = { ...input, id: crypto.randomUUID() }
    setExpenses((prev) => {
      const next = [...prev, expense]
      saveExpenses(next)
      return next
    })
  }

  function updateExpense(id: string, input: Omit<Expense, 'id'>) {
    setExpenses((prev) => {
      const next = prev.map((e) => (e.id === id ? { ...input, id } : e))
      saveExpenses(next)
      return next
    })
  }

  function deleteExpense(id: string) {
    setExpenses((prev) => {
      const next = prev.filter((e) => e.id !== id)
      saveExpenses(next)
      return next
    })
  }

  return { expenses, addExpense, updateExpense, deleteExpense }
}
