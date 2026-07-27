import { CATEGORIES, type Category, type Expense } from '../types/expense'
import type { SavingsGoal } from '../types/savingsGoal'
import { totalSpent } from './calculations'
import {
  addMonths,
  daysBetweenInclusive,
  firstDayOfMonth,
  lastDayOfMonth,
  toISODate,
  toMonthKey,
} from './date'

// ---------- カテゴリ別の月次推移 ----------

export interface CategoryMonthlyTrendPoint {
  month: string
  amounts: Record<Category, number>
  total: number
}

/** 直近 monthsCount ヶ月分（今月を含む）のカテゴリ別支出額 */
export function categoryMonthlyTrend(
  expenses: Expense[],
  monthsCount: number,
  today: Date = new Date(),
): CategoryMonthlyTrendPoint[] {
  const currentMonth = toMonthKey(today)
  const months = Array.from({ length: monthsCount }, (_, i) =>
    addMonths(currentMonth, i - (monthsCount - 1)),
  )
  return months.map((month) => {
    const amounts = Object.fromEntries(
      CATEGORIES.map((category) => [
        category,
        totalSpent(
          expenses.filter((e) => e.category === category),
          month,
        ),
      ]),
    ) as Record<Category, number>
    return { month, amounts, total: totalSpent(expenses, month) }
  })
}

// ---------- 通常レンジからの逸脱検知（平均 ± 1標準偏差） ----------

const DEVIATION_LOOKBACK_MONTHS = 6
const MIN_ACTIVE_MONTHS_FOR_DEVIATION = 3

export interface CategoryDeviationInsight {
  category: Category
  currentAmount: number
  average: number
  stdDev: number
  direction: 'high' | 'low'
}

export type DeviationAnalysis =
  | { status: 'insufficientData'; activeMonths: number; requiredMonths: number }
  | { status: 'ok'; insights: CategoryDeviationInsight[] }

function sampleStdDev(values: number[]): number {
  if (values.length < 2) return 0
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length
  const variance =
    values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / (values.length - 1)
  return Math.sqrt(variance)
}

/**
 * 直近6ヶ月のうち実際にデータのある月（=平均・標準偏差の算出対象）を「アクティブな月」とし、
 * 3ヶ月に満たない場合はデータ不足として扱う（閾値は実装判断）。
 */
export function categoryDeviationAnalysis(
  expenses: Expense[],
  today: Date = new Date(),
): DeviationAnalysis {
  const currentMonth = toMonthKey(today)
  const lookbackMonths = Array.from({ length: DEVIATION_LOOKBACK_MONTHS }, (_, i) =>
    addMonths(currentMonth, -(i + 1)),
  )
  const activeMonths = lookbackMonths.filter((month) => totalSpent(expenses, month) > 0)

  if (activeMonths.length < MIN_ACTIVE_MONTHS_FOR_DEVIATION) {
    return {
      status: 'insufficientData',
      activeMonths: activeMonths.length,
      requiredMonths: MIN_ACTIVE_MONTHS_FOR_DEVIATION,
    }
  }

  const insights: CategoryDeviationInsight[] = []
  for (const category of CATEGORIES) {
    const categoryExpenses = expenses.filter((e) => e.category === category)
    const pastAmounts = activeMonths.map((month) => totalSpent(categoryExpenses, month))
    const average = pastAmounts.reduce((sum, v) => sum + v, 0) / pastAmounts.length
    const stdDev = sampleStdDev(pastAmounts)
    const currentAmount = totalSpent(categoryExpenses, currentMonth)

    if (currentAmount > average + stdDev) {
      insights.push({ category, currentAmount, average, stdDev, direction: 'high' })
    } else if (currentAmount < average - stdDev) {
      insights.push({ category, currentAmount, average, stdDev, direction: 'low' })
    }
  }

  return { status: 'ok', insights }
}

// ---------- 前月比・前年同月比 ----------

export interface AmountComparison {
  current: number
  reference: number | null
  diff: number | null
  percentChange: number | null
}

function buildComparison(
  current: number,
  reference: number,
  hasReferenceData: boolean,
): AmountComparison {
  if (!hasReferenceData) {
    return { current, reference: null, diff: null, percentChange: null }
  }
  const diff = current - reference
  const percentChange = reference !== 0 ? (diff / reference) * 100 : null
  return { current, reference, diff, percentChange }
}

export interface PeriodComparisons {
  total: { monthOverMonth: AmountComparison; yearOverYear: AmountComparison }
  byCategory: Array<{
    category: Category
    monthOverMonth: AmountComparison
    yearOverYear: AmountComparison
  }>
}

/** 前月・前年同月に記録があった月かどうか（=比較対象データの有無） */
function monthHasAnyData(expenses: Expense[], month: string): boolean {
  return expenses.some((e) => e.date.slice(0, 7) === month)
}

export function periodComparisons(
  expenses: Expense[],
  today: Date = new Date(),
): PeriodComparisons {
  const currentMonth = toMonthKey(today)
  const previousMonth = addMonths(currentMonth, -1)
  const sameMonthLastYear = addMonths(currentMonth, -12)
  const hasPreviousMonthData = monthHasAnyData(expenses, previousMonth)
  const hasLastYearData = monthHasAnyData(expenses, sameMonthLastYear)

  const total = {
    monthOverMonth: buildComparison(
      totalSpent(expenses, currentMonth),
      totalSpent(expenses, previousMonth),
      hasPreviousMonthData,
    ),
    yearOverYear: buildComparison(
      totalSpent(expenses, currentMonth),
      totalSpent(expenses, sameMonthLastYear),
      hasLastYearData,
    ),
  }

  const byCategory = CATEGORIES.map((category) => {
    const categoryExpenses = expenses.filter((e) => e.category === category)
    return {
      category,
      monthOverMonth: buildComparison(
        totalSpent(categoryExpenses, currentMonth),
        totalSpent(categoryExpenses, previousMonth),
        hasPreviousMonthData,
      ),
      yearOverYear: buildComparison(
        totalSpent(categoryExpenses, currentMonth),
        totalSpent(categoryExpenses, sameMonthLastYear),
        hasLastYearData,
      ),
    }
  })

  return { total, byCategory }
}

// ---------- 曜日・週単位の傾向 ----------

export interface WeekdayTotal {
  weekday: number
  label: string
  total: number
}

const WEEKDAY_LABELS = ['日', '月', '火', '水', '木', '金', '土']

export function weekdaySpendingPattern(expenses: Expense[]): WeekdayTotal[] {
  const totals = Array(7).fill(0) as number[]
  for (const e of expenses) {
    const weekday = new Date(`${e.date}T00:00:00`).getDay()
    totals[weekday] += e.amount
  }
  return WEEKDAY_LABELS.map((label, weekday) => ({ weekday, label, total: totals[weekday] }))
}

export interface WeekdayWeekendInsight {
  category: Category
  weekendShare: number
  neutralShare: number
  direction: 'weekend' | 'weekday'
}

const WEEKEND_NEUTRAL_SHARE = 2 / 7
const MIN_TOTAL_FOR_WEEKEND_INSIGHT = 3000
const MIN_SHARE_GAP = 0.15

/**
 * 週末(土日)の支出割合が、日数比から期待される割合(2/7)より大きく偏っているカテゴリを1つ検出する。
 * 固定テンプレート文の材料として使う（最も偏りが大きいカテゴリのみ返す）。
 */
export function weekdayWeekendInsight(expenses: Expense[]): WeekdayWeekendInsight | null {
  let strongest: WeekdayWeekendInsight | null = null
  let strongestGap = 0

  for (const category of CATEGORIES) {
    const categoryExpenses = expenses.filter((e) => e.category === category)
    const total = totalSpent(categoryExpenses)
    if (total < MIN_TOTAL_FOR_WEEKEND_INSIGHT) continue

    const weekendTotal = categoryExpenses
      .filter((e) => {
        const day = new Date(`${e.date}T00:00:00`).getDay()
        return day === 0 || day === 6
      })
      .reduce((sum, e) => sum + e.amount, 0)
    const weekendShare = weekendTotal / total
    const gap = Math.abs(weekendShare - WEEKEND_NEUTRAL_SHARE)

    if (gap >= MIN_SHARE_GAP && gap > strongestGap) {
      strongestGap = gap
      strongest = {
        category,
        weekendShare,
        neutralShare: WEEKEND_NEUTRAL_SHARE,
        direction: weekendShare > WEEKEND_NEUTRAL_SHARE ? 'weekend' : 'weekday',
      }
    }
  }

  return strongest
}

// ---------- 目標達成予測 ----------

export interface GoalForecast {
  averageDailySpend: number
  projectedTotalSpend: number
  yearlyTargetAmount: number
  projectedSurplus: number
  onTrack: boolean
  /** 目標期間が既に終了しているか（true なら「予測」ではなく確定実績） */
  isFinal: boolean
}

/** 現在までの支出ペースが目標期間の最後まで続いた場合の着地予測 */
export function goalForecast(
  goal: SavingsGoal,
  expenses: Expense[],
  today: Date = new Date(),
): GoalForecast | null {
  const startDate = firstDayOfMonth(goal.startMonth)
  const endDate = lastDayOfMonth(goal.endMonth)
  if (today < startDate) return null

  const elapsedEndDate = today < endDate ? today : endDate
  const elapsedDays = daysBetweenInclusive(startDate, elapsedEndDate)
  const totalDays = daysBetweenInclusive(startDate, endDate)

  const spentSoFar = totalSpent(
    expenses.filter(
      (e) => e.date >= `${goal.startMonth}-01` && e.date <= toISODate(elapsedEndDate),
    ),
  )

  const averageDailySpend = elapsedDays > 0 ? spentSoFar / elapsedDays : 0
  const projectedTotalSpend = averageDailySpend * totalDays
  const projectedSurplus = goal.yearlyTargetAmount - projectedTotalSpend

  return {
    averageDailySpend,
    projectedTotalSpend,
    yearlyTargetAmount: goal.yearlyTargetAmount,
    projectedSurplus,
    onTrack: projectedSurplus >= 0,
    isFinal: today >= endDate,
  }
}
