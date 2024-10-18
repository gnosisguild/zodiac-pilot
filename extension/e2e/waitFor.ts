type Fn<T> = () => T

export const waitFor = <T>(fn: Fn<T>): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    const timeout = setTimeout(reject, 5000)

    const waitFn = () => {
      try {
        const result = fn()

        clearTimeout(timeout)

        resolve(result)
      } catch {
        setTimeout(waitFn, 1)
      }
    }

    waitFn()
  })
}
