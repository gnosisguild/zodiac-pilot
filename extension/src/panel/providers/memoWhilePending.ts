let pendingPromise: Promise<any> | null = null

export const memoWhilePending = <T extends (...args: any) => Promise<any>>(
  callback: T
): T =>
  ((...args) => {
    if (pendingPromise) return pendingPromise
    pendingPromise = callback(...args)
    pendingPromise.finally(() => {
      pendingPromise = null
    })
    return pendingPromise
  }) as T
