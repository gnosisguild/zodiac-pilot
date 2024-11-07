export const memoWhilePending = <
  T extends (...args: any) => Promise<Awaited<ReturnType<T>>>,
>(
  callback: T
): T => {
  let pendingPromise: Promise<Awaited<ReturnType<T>>> | null = null

  return ((...args) => {
    if (pendingPromise) {
      return pendingPromise
    }

    pendingPromise = callback(...args)

    pendingPromise.finally(() => {
      pendingPromise = null
    })

    return pendingPromise
  }) as T
}
