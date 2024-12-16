import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react'
import { ConnectProvider } from './ConnectProvider'

const ConnectProviderContext = createContext<ConnectProvider | null>(null)

export const ProvideConnectProvider = ({
  children,
  windowId,
}: PropsWithChildren<{ windowId?: number }>) => {
  const [provider, setProvider] = useState<ConnectProvider | null>(null)

  useEffect(() => {
    setProvider(windowId == null ? null : new ConnectProvider(windowId))
  }, [windowId])

  return (
    <ConnectProviderContext value={provider}>{children}</ConnectProviderContext>
  )
}

export const useConnectProviderInstance = () =>
  useContext(ConnectProviderContext)
