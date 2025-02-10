import type { PropsWithChildren } from 'react'
import { useIsDev } from '../DevelopmentContext'
import { useSatisfiesVersion } from './ExtensionVersionContext'

export const MinimumVersion = ({
  children,
  version,
}: PropsWithChildren<{ version: string }>) => {
  const satisfiesVersion = useSatisfiesVersion(version)
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

  if (satisfiesVersion) {
    return children
  }

  return null
}
