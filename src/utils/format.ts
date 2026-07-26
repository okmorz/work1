const yenFormatter = new Intl.NumberFormat('ja-JP')

export function formatYen(amount: number): string {
  return `${yenFormatter.format(Math.round(amount))}円`
}
