import { useStableHandler } from '@zodiac/ui'
import { useEffect, useRef } from 'react'
import { useIsPending } from './useIsPending'

type CallbackFn = () => void

export const useAfterSubmit = (
  intent: string | string[] = [],
  callback: CallbackFn,
) => {
  const pending = useIsPending(intent)
  const pendingRef = useRef(pending)

  const callbackRef = useStableHandler(callback)

  useEffect(() => {
    if (pending === false && pendingRef.current === true) {
      callbackRef.current()
    }

    pendingRef.current = pending
  }, [callbackRef, pending])
}
