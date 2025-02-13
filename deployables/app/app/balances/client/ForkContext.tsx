import {
  CompanionAppMessageType,
  CompanionResponseMessageType,
  type CompanionAppMessage,
  type CompanionResponseMessage,
} from '@zodiac/messages'
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
    const handleForkUpdate = (
      message: MessageEvent<CompanionResponseMessage>,
    ) => {
      if (message.data == null) {
        return
      }

      if (message.data.type !== CompanionResponseMessageType.FORK_UPDATED) {
        return
      }

      setForkUrl(message.data.forkUrl)
    }

    window.addEventListener('message', handleForkUpdate)

    window.postMessage(
      {
        type: CompanionAppMessageType.REQUEST_FORK_INFO,
      } satisfies CompanionAppMessage,
      '*',
    )

    return () => {
      window.removeEventListener('message', handleForkUpdate)
    }
  }, [])

  return forkUrl
}
