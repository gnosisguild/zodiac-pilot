type Options = {
  force?: boolean
}

type Fn<T extends (...args: any) => Promise<Awaited<ReturnType<T>>>> = (
  options: Options,
  ...args: Parameters<T>
) => Promise<Awaited<ReturnType<T>>>

export const memoWhilePending = <
  T extends (...args: any) => Promise<Awaited<ReturnType<T>>>,
>(
  callback: T,
): Fn<T> => {
  let pendingPromise: Promise<Awaited<ReturnType<T>>> | null = null

  return (({ force }: Options = {}, ...args) => {
    if (pendingPromise && !force) {
      return pendingPromise
    }

    pendingPromise = new Promise((resolve, reject) => {
      callback(...args)
        .then(resolve)
        .catch(reject)
        .finally(() => {
          pendingPromise = null
        })
    })

    return pendingPromise
  }) as T
}
