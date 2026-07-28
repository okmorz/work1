import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from './AuthContext'
import { mergeSyncedRecords, resolveGoal } from '../lib/merge'
import {
  clearAllLocalData,
  loadExpenses,
  loadIncomes,
  loadPendingExpenseDeletes,
  loadPendingIncomeDeletes,
  loadSavingsGoal,
  saveExpenses,
  saveIncomes,
  savePendingExpenseDeletes,
  savePendingIncomeDeletes,
  saveSavingsGoal,
} from '../lib/storage'
import {
  deleteRemoteExpense,
  deleteRemoteIncome,
  fetchRemoteExpenses,
  fetchRemoteGoal,
  fetchRemoteIncomes,
  upsertRemoteExpense,
  upsertRemoteGoal,
  upsertRemoteIncome,
} from '../lib/syncApi'
import type { Expense } from '../types/expense'
import type { Income } from '../types/income'
import type { SavingsGoal } from '../types/savingsGoal'

type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error'

interface DataContextValue {
  expenses: Expense[]
  incomes: Income[]
  goal: SavingsGoal | null
  addExpense: (input: Omit<Expense, 'id' | 'syncedAt'>) => void
  updateExpense: (id: string, input: Omit<Expense, 'id' | 'syncedAt'>) => void
  deleteExpense: (id: string) => void
  addIncome: (input: Omit<Income, 'id' | 'syncedAt'>) => void
  updateIncome: (id: string, input: Omit<Income, 'id' | 'syncedAt'>) => void
  deleteIncome: (id: string) => void
  setGoal: (input: Omit<SavingsGoal, 'syncedAt'>) => void
  syncStatus: SyncStatus
  lastSyncedAt: string | null
  syncError: string | null
}

const DataContext = createContext<DataContextValue | null>(null)

const SYNC_INTERVAL_MS = 60 * 60 * 1000

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err)
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState<Expense[]>(() => loadExpenses())
  const [incomes, setIncomes] = useState<Income[]>(() => loadIncomes())
  const [goal, setGoalState] = useState<SavingsGoal | null>(() =>
    loadSavingsGoal(),
  )
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle')
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null)
  const [syncError, setSyncError] = useState<string | null>(null)

  const expensesRef = useRef(expenses)
  expensesRef.current = expenses
  const incomesRef = useRef(incomes)
  incomesRef.current = incomes
  const goalRef = useRef(goal)
  goalRef.current = goal

  const wasSignedIn = useRef(false)

  function markExpenseSynced(id: string) {
    setExpenses((prev) => {
      const next = prev.map((e) =>
        e.id === id ? { ...e, syncedAt: new Date().toISOString() } : e,
      )
      saveExpenses(next)
      return next
    })
  }

  function markIncomeSynced(id: string) {
    setIncomes((prev) => {
      const next = prev.map((i) =>
        i.id === id ? { ...i, syncedAt: new Date().toISOString() } : i,
      )
      saveIncomes(next)
      return next
    })
  }

  function markGoalSynced() {
    setGoalState((prev) => {
      if (!prev) return prev
      const next = { ...prev, syncedAt: new Date().toISOString() }
      saveSavingsGoal(next)
      return next
    })
  }

  async function reconcile(userId: string) {
    setSyncStatus('syncing')
    try {
      const pendingExpenseDeletes = loadPendingExpenseDeletes()
      const stillPendingExpenseDeletes: string[] = []
      for (const id of pendingExpenseDeletes) {
        try {
          await deleteRemoteExpense(id)
        } catch {
          stillPendingExpenseDeletes.push(id)
        }
      }
      savePendingExpenseDeletes(stillPendingExpenseDeletes)

      const pendingIncomeDeletes = loadPendingIncomeDeletes()
      const stillPendingIncomeDeletes: string[] = []
      for (const id of pendingIncomeDeletes) {
        try {
          await deleteRemoteIncome(id)
        } catch {
          stillPendingIncomeDeletes.push(id)
        }
      }
      savePendingIncomeDeletes(stillPendingIncomeDeletes)

      const [remoteExpenses, remoteIncomes, remoteGoal] = await Promise.all([
        fetchRemoteExpenses(userId),
        fetchRemoteIncomes(userId),
        fetchRemoteGoal(userId),
      ])

      const mergedExpenses = mergeSyncedRecords(
        expensesRef.current,
        remoteExpenses,
        new Set(stillPendingExpenseDeletes),
      )
      setExpenses(mergedExpenses)
      saveExpenses(mergedExpenses)

      const mergedIncomes = mergeSyncedRecords(
        incomesRef.current,
        remoteIncomes,
        new Set(stillPendingIncomeDeletes),
      )
      setIncomes(mergedIncomes)
      saveIncomes(mergedIncomes)

      const mergedGoal = resolveGoal(goalRef.current, remoteGoal)
      setGoalState(mergedGoal)
      if (mergedGoal) saveSavingsGoal(mergedGoal)

      for (const expense of mergedExpenses) {
        if (expense.syncedAt) continue
        try {
          await upsertRemoteExpense(userId, expense)
          markExpenseSynced(expense.id)
        } catch {
          // 未送信のまま残し、次回のreconcileで再試行する
        }
      }

      for (const income of mergedIncomes) {
        if (income.syncedAt) continue
        try {
          await upsertRemoteIncome(userId, income)
          markIncomeSynced(income.id)
        } catch {
          // 未送信のまま残し、次回のreconcileで再試行する
        }
      }

      if (mergedGoal && !mergedGoal.syncedAt) {
        try {
          await upsertRemoteGoal(userId, mergedGoal)
          markGoalSynced()
        } catch {
          // 未送信のまま残し、次回のreconcileで再試行する
        }
      }

      setSyncStatus('synced')
      setLastSyncedAt(new Date().toISOString())
      setSyncError(null)
    } catch (err) {
      setSyncStatus('error')
      setSyncError(errorMessage(err))
    }
  }

  useEffect(() => {
    if (!user) {
      if (wasSignedIn.current) {
        clearAllLocalData()
        setExpenses([])
        setIncomes([])
        setGoalState(null)
        setSyncStatus('idle')
        setLastSyncedAt(null)
        setSyncError(null)
      }
      wasSignedIn.current = false
      return
    }
    wasSignedIn.current = true

    reconcile(user.id)
    const interval = setInterval(() => reconcile(user.id), SYNC_INTERVAL_MS)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  async function pushExpense(expense: Expense) {
    if (!user) return
    try {
      await upsertRemoteExpense(user.id, expense)
      markExpenseSynced(expense.id)
      setSyncStatus('synced')
      setLastSyncedAt(new Date().toISOString())
      setSyncError(null)
    } catch (err) {
      setSyncStatus('error')
      setSyncError(errorMessage(err))
    }
  }

  async function pushExpenseDelete(id: string) {
    if (!user) return
    try {
      await deleteRemoteExpense(id)
      savePendingExpenseDeletes(
        loadPendingExpenseDeletes().filter((pid) => pid !== id),
      )
      setSyncStatus('synced')
      setLastSyncedAt(new Date().toISOString())
      setSyncError(null)
    } catch (err) {
      setSyncStatus('error')
      setSyncError(errorMessage(err))
    }
  }

  async function pushIncome(income: Income) {
    if (!user) return
    try {
      await upsertRemoteIncome(user.id, income)
      markIncomeSynced(income.id)
      setSyncStatus('synced')
      setLastSyncedAt(new Date().toISOString())
      setSyncError(null)
    } catch (err) {
      setSyncStatus('error')
      setSyncError(errorMessage(err))
    }
  }

  async function pushIncomeDelete(id: string) {
    if (!user) return
    try {
      await deleteRemoteIncome(id)
      savePendingIncomeDeletes(
        loadPendingIncomeDeletes().filter((pid) => pid !== id),
      )
      setSyncStatus('synced')
      setLastSyncedAt(new Date().toISOString())
      setSyncError(null)
    } catch (err) {
      setSyncStatus('error')
      setSyncError(errorMessage(err))
    }
  }

  async function pushGoal(goalToPush: SavingsGoal) {
    if (!user) return
    try {
      await upsertRemoteGoal(user.id, goalToPush)
      markGoalSynced()
      setSyncStatus('synced')
      setLastSyncedAt(new Date().toISOString())
      setSyncError(null)
    } catch (err) {
      setSyncStatus('error')
      setSyncError(errorMessage(err))
    }
  }

  function addExpense(input: Omit<Expense, 'id' | 'syncedAt'>) {
    const expense: Expense = { ...input, id: crypto.randomUUID() }
    setExpenses((prev) => {
      const next = [...prev, expense]
      saveExpenses(next)
      return next
    })
    void pushExpense(expense)
  }

  function updateExpense(id: string, input: Omit<Expense, 'id' | 'syncedAt'>) {
    const expense: Expense = { ...input, id }
    setExpenses((prev) => {
      const next = prev.map((e) => (e.id === id ? expense : e))
      saveExpenses(next)
      return next
    })
    void pushExpense(expense)
  }

  function deleteExpense(id: string) {
    setExpenses((prev) => {
      const next = prev.filter((e) => e.id !== id)
      saveExpenses(next)
      return next
    })
    savePendingExpenseDeletes([
      ...new Set([...loadPendingExpenseDeletes(), id]),
    ])
    void pushExpenseDelete(id)
  }

  function addIncome(input: Omit<Income, 'id' | 'syncedAt'>) {
    const income: Income = { ...input, id: crypto.randomUUID() }
    setIncomes((prev) => {
      const next = [...prev, income]
      saveIncomes(next)
      return next
    })
    void pushIncome(income)
  }

  function updateIncome(id: string, input: Omit<Income, 'id' | 'syncedAt'>) {
    const income: Income = { ...input, id }
    setIncomes((prev) => {
      const next = prev.map((i) => (i.id === id ? income : i))
      saveIncomes(next)
      return next
    })
    void pushIncome(income)
  }

  function deleteIncome(id: string) {
    setIncomes((prev) => {
      const next = prev.filter((i) => i.id !== id)
      saveIncomes(next)
      return next
    })
    savePendingIncomeDeletes([...new Set([...loadPendingIncomeDeletes(), id])])
    void pushIncomeDelete(id)
  }

  function setGoal(input: Omit<SavingsGoal, 'syncedAt'>) {
    const nextGoal: SavingsGoal = { ...input }
    setGoalState(nextGoal)
    saveSavingsGoal(nextGoal)
    void pushGoal(nextGoal)
  }

  return (
    <DataContext.Provider
      value={{
        expenses,
        incomes,
        goal,
        addExpense,
        updateExpense,
        deleteExpense,
        addIncome,
        updateIncome,
        deleteIncome,
        setGoal,
        syncStatus,
        lastSyncedAt,
        syncError,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
