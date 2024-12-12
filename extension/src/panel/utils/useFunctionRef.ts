import { useEffect, useRef } from 'react'

type Fn<T> = (...args: T[]) => void

export function useFunctionRef<T>(fn: Fn<T>) {
  const functionRef = useRef(fn)

  useEffect(() => {
    functionRef.current = fn
  }, [fn])

  return functionRef
}
