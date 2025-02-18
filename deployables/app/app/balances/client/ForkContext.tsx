import { CompanionAppMessageType, companionRequest } from '@zodiac/messages'
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react'

const ForkContext = createContext<string | null>(null)

type ProvideForkContextProps = PropsWithChildren

export const ProvideForkContext = ({ children }: ProvideForkContextProps) => {
  const forkUrl = useListenForForkUrl()

  return <ForkContext value={forkUrl}>{children}</ForkContext>
}

export const useForkUrl = () => useContext(ForkContext)

const useListenForForkUrl = () => {
  const [forkUrl, setForkUrl] = useState<string | null>(null)

  useEffect(() => {
    return companionRequest(
      {
        type: CompanionAppMessageType.REQUEST_FORK_INFO,
      },
      (response) => setForkUrl(response.forkUrl),
    )
  }, [])

  return forkUrl
}
