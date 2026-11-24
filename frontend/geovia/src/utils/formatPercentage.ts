export function formatPercentage(value: number | string) {
  const percentage = Number(value)
  if (!Number.isFinite(percentage)) return '0%'
  const formatted = percentage.toFixed(2).replace(/\.?0+$/, '')
  return `${formatted}%`
}
