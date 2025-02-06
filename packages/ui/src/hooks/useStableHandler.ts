import { useEffect, useRef } from 'react'

export const useStableHandler = <T>(handler: T) => {
  const handlerRef = useRef(handler)

  useEffect(() => {
    handlerRef.current = handler
  }, [handler])

  return handlerRef
}
