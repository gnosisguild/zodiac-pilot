import { ZodiacRoute } from '@/types'
import { useEffect, useRef } from 'react'
import { useWalletConnectProvider } from './useWalletConnectProvider'

type Options = {
  onDisconnect: () => void
}

export const useDisconnectWalletConnectIfNeeded = (
  route: ZodiacRoute,
  { onDisconnect }: Options
) => {
  const provider = useWalletConnectProvider(route.id)
  const onDisconnectRef = useRef(onDisconnect)

  useEffect(() => {
    onDisconnectRef.current = onDisconnect
  }, [onDisconnect])

  useEffect(() => {
    if (provider == null) {
      return
    }

    const handleDisconnect = () => onDisconnectRef.current()

    provider.on('disconnect', handleDisconnect)

    return () => {
      provider.off('disconnect', handleDisconnect)
    }
  }, [provider])
}
