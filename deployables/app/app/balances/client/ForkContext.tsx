import { CompanionAppMessageType, companionRequest } from '@zodiac/messages'
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react'

interface ForkContextValue {
  forkUrl: string | null
  vnetId: string | null
}

const ForkContext = createContext<ForkContextValue>({
  forkUrl: null,
  vnetId: null,
})

type ProvideForkContextProps = PropsWithChildren

export const ProvideForkContext = ({ children }: ProvideForkContextProps) => {
  const forkContextValue = useListenForForkInfo()

  return <ForkContext value={forkContextValue}>{children}</ForkContext>
}

export const useForkUrl = () => useContext(ForkContext)

const useListenForForkInfo = () => {
  const [forkInfo, setForkInfo] = useState<ForkContextValue>({
    forkUrl: null,
    vnetId: null,
  })

  useEffect(() => {
    return companionRequest(
      {
        type: CompanionAppMessageType.REQUEST_FORK_INFO,
      },
      (response) => {
        setForkInfo({ forkUrl: response.forkUrl, vnetId: response.vnetId })
      },
    )
  }, [])

  return forkInfo
}
