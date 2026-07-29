export interface SavingsGoal {
  yearlyTargetAmount: number
  startMonth: string // YYYY-MM
  endMonth: string // YYYY-MM
  /** 実績収入データがまだない月の計算で暫定的に使う、月の平均収入の見込み */
  estimatedMonthlyIncome: number
  syncedAt?: string
}
