import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from './AuthContext'
import { mergeExpenses, resolveGoal } from '../lib/merge'
import {
  clearAllLocalData,
  loadExpenses,
  loadPendingDeletes,
  loadSavingsGoal,
  saveExpenses,
  savePendingDeletes,
  saveSavingsGoal,
} from '../lib/storage'
import {
  deleteRemoteExpense,
  fetchRemoteExpenses,
  fetchRemoteGoal,
  upsertRemoteExpense,
  upsertRemoteGoal,
} from '../lib/syncApi'
import type { Expense } from '../types/expense'
import type { SavingsGoal } from '../types/savingsGoal'

type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error'

interface DataContextValue {
  expenses: Expense[]
  goal: SavingsGoal | null
  addExpense: (input: Omit<Expense, 'id' | 'syncedAt'>) => void
  updateExpense: (id: string, input: Omit<Expense, 'id' | 'syncedAt'>) => void
  deleteExpense: (id: string) => void
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
  const [goal, setGoalState] = useState<SavingsGoal | null>(() =>
    loadSavingsGoal(),
  )
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle')
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null)
  const [syncError, setSyncError] = useState<string | null>(null)

  const expensesRef = useRef(expenses)
  expensesRef.current = expenses
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
      const pendingDeletes = loadPendingDeletes()
      const stillPending: string[] = []
      for (const id of pendingDeletes) {
        try {
          await deleteRemoteExpense(id)
        } catch {
          stillPending.push(id)
        }
      }
      savePendingDeletes(stillPending)

      const [remoteExpenses, remoteGoal] = await Promise.all([
        fetchRemoteExpenses(userId),
        fetchRemoteGoal(userId),
      ])

      const mergedExpenses = mergeExpenses(
        expensesRef.current,
        remoteExpenses,
        new Set(stillPending),
      )
      setExpenses(mergedExpenses)
      saveExpenses(mergedExpenses)

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

  async function pushDelete(id: string) {
    if (!user) return
    try {
      await deleteRemoteExpense(id)
      savePendingDeletes(loadPendingDeletes().filter((pid) => pid !== id))
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
    savePendingDeletes([...new Set([...loadPendingDeletes(), id])])
    void pushDelete(id)
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
        goal,
        addExpense,
        updateExpense,
        deleteExpense,
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
