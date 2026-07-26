export function toMonthKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

export function daysInMonth(monthKey: string): number {
  const [year, month] = monthKey.split('-').map(Number)
  return new Date(year, month, 0).getDate()
}

export function remainingDaysInMonth(monthKey: string, today: Date): number {
  const total = daysInMonth(monthKey)
  if (toMonthKey(today) !== monthKey) return total
  return total - today.getDate() + 1
}

export function monthsBetweenInclusive(startMonth: string, endMonth: string): number {
  const [startYear, startMonthNum] = startMonth.split('-').map(Number)
  const [endYear, endMonthNum] = endMonth.split('-').map(Number)
  return (endYear - startYear) * 12 + (endMonthNum - startMonthNum) + 1
}

export function remainingMonthsInclusive(
  currentMonth: string,
  endMonth: string,
): number {
  return Math.max(0, monthsBetweenInclusive(currentMonth, endMonth))
}

export function addMonths(monthKey: string, delta: number): string {
  const [year, month] = monthKey.split('-').map(Number)
  const date = new Date(year, month - 1 + delta, 1)
  return toMonthKey(date)
}
