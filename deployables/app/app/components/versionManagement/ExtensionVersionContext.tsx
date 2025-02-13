import {
  CompanionAppMessageType,
  CompanionResponseMessageType,
  type CompanionAppMessage,
  type CompanionResponseMessage,
} from '@zodiac/messages'
import { compare } from 'compare-versions'
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react'

export const ExtensionVersionContext = createContext<string | null>(null)

export const ProvideExtensionVersion = ({ children }: PropsWithChildren) => (
  <ExtensionVersionContext value={useGetVersionFromExtension()}>
    {children}
  </ExtensionVersionContext>
)

const useGetVersionFromExtension = () => {
  const [version, setVersion] = useState<string | null>(null)

  useEffect(() => {
    const handleVersion = (event: MessageEvent<CompanionResponseMessage>) => {
      if (event.data.type !== CompanionResponseMessageType.PROVIDE_VERSION) {
        return
      }

      setVersion(event.data.version)
    }

    window.addEventListener('message', handleVersion)

    window.postMessage(
      {
        type: CompanionAppMessageType.REQUEST_VERSION,
      } satisfies CompanionAppMessage,
      '*',
    )

    return () => {
      window.removeEventListener('message', handleVersion)
    }
  }, [])

  return version
}

export const useExtensionVersion = () => useContext(ExtensionVersionContext)

export const useSatisfiesVersion = (targetVersion: string) => {
  const extensionVersion = useExtensionVersion()

  if (extensionVersion == null) {
    return false
  }

  return compare(extensionVersion, targetVersion, '>=')
}
