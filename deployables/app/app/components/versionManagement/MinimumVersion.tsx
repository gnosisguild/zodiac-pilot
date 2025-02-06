import { compare } from 'compare-versions'
import type { PropsWithChildren } from 'react'
import { useIsDev } from '../DevelopmentContext'
import { useExtensionVersion } from './ExtensionVersionContext'

export const MinimumVersion = ({
  children,
  version,
}: PropsWithChildren<{ version: string }>) => {
  const extensionVersion = useExtensionVersion()
  const isDev = useIsDev()

  if (isDev) {
    return (
      <div className="rounded border border-yellow-900/80">
        <div className="flex items-center gap-2 p-2 text-xs uppercase">
          <span className="opacity-75">From version:</span>
          <span className="font-semibold">{version}</span>
        </div>

        {children}
      </div>
    )
  }

  // Extension too old to even support this feature
  if (extensionVersion == null) {
    return null
  }

  if (compare(extensionVersion, version, '>=')) {
    return children
  }

  return null
}
