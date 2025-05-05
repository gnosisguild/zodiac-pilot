import { useEffect, useRef } from 'react'
import { useActionData } from 'react-router'
import { useIsPending, type CheckFn } from './useIsPending'
import { useStableHandler } from './useStableHandler'

type CallbackFn<T> = (actionData: T) => void

export const useAfterSubmit = <
  T,
  F extends (...args: any) => any = typeof useActionData<T>,
  D extends ReturnType<F> | undefined = F extends undefined
    ? void
    : ReturnType<F>,
>(
  intent: string | string[] = [],
  callback: CallbackFn<D>,
  ...checkFns: CheckFn[]
) => {
  const pending = useIsPending(intent, ...checkFns)
  const pendingRef = useRef(pending)

  const actionData = useActionData<T>() as ReturnType<F>

  const callbackRef = useStableHandler(() => callback(actionData))

  useEffect(() => {
    if (pending === false && pendingRef.current === true) {
      callbackRef.current()
    }

    pendingRef.current = pending
  }, [callbackRef, pending])
}
