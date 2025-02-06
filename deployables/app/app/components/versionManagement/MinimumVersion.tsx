import { compare } from 'compare-versions'
import type { PropsWithChildren } from 'react'
import { useExtensionVersion } from './ExtensionVersionContext'

export const MinimumVersion = ({
  children,
  version,
}: PropsWithChildren<{ version: string }>) => {
  const extensionVersion = useExtensionVersion()

  // Extension too old to even support this feature
  if (extensionVersion == null) {
    return null
  }

  if (compare(extensionVersion, version, '>=')) {
    return children
  }

  return null
}
