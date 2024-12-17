import { useWindowId } from '@/inject-bridge'
import type { Eip1193Provider } from '@/types'
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react'
import { ConnectProvider } from './ConnectProvider'

const ConnectProviderContext = createContext<{
  provider: Eip1193Provider | null
  ready: boolean
}>({ provider: null, ready: false })

type ProvideConnectProviderProps = PropsWithChildren<{
  /**
   * DO NOT USE THIS OR YOU WILL BE FIRED
   * No, but seriously this prop is meant for testing only,
   * so that we can inject a controlled provider instance.
   * Don't use it in the actual app.
   */
  initialProvider?: Eip1193Provider | null
}>

export const ProvideConnectProvider = ({
  children,
  initialProvider = null,
}: ProvideConnectProviderProps) => {
  const windowId = useWindowId()
  const windowIdRef = useRef(windowId)
  const [provider, setProvider] = useState<Eip1193Provider | null>(() => {
    if (initialProvider != null) {
      return initialProvider
    }

    if (windowId == null) {
      return null
    }

    return new ConnectProvider(windowId)
  })
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (windowIdRef.current === windowId) {
      return
    }

    windowIdRef.current = windowId

    setProvider(windowId == null ? null : new ConnectProvider(windowId))
  }, [windowId])

  useEffect(() => {
    if (provider == null) {
      return
    }

    provider.on('readyChanged', setReady)

    return () => {
      provider.removeListener('readyChanged', setReady)
    }
  }, [provider])

  return (
    <ConnectProviderContext value={{ provider, ready }}>
      {children}
    </ConnectProviderContext>
  )
}

export const useConnectProviderInstance = () => {
  const { provider } = useContext(ConnectProviderContext)

  return provider
}

export const useConnectProviderReady = () => {
  const { ready } = useContext(ConnectProviderContext)

  return ready
}
