export function getAppUsageCount(url: string): number {
  const value = localStorage.getItem(`usage-count::${url}`) || ''
  return Number.isInteger(parseInt(value)) ? parseInt(value) : 0
}

export function markAppAsUsed(url: string) {
  const count = getAppUsageCount(url)
  localStorage.setItem(`usage-count::${url}`, String(count + 1))
}
