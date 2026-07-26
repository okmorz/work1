import { useState } from 'react'
import { loadSavingsGoal, saveSavingsGoal } from '../lib/storage'
import type { SavingsGoal } from '../types/savingsGoal'

export function useSavingsGoal() {
  const [goal, setGoalState] = useState<SavingsGoal | null>(() =>
    loadSavingsGoal(),
  )

  function setGoal(goal: SavingsGoal) {
    saveSavingsGoal(goal)
    setGoalState(goal)
  }

  return { goal, setGoal }
}
