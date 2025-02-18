import { CompanionAppMessageType, companionRequest } from '@zodiac/messages'
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
    return companionRequest(
      {
        type: CompanionAppMessageType.REQUEST_VERSION,
      },
      (response) => setVersion(response.version),
    )
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
