import { Popover } from '@zodiac/ui'
import type { PropsWithChildren, ReactNode } from 'react'
import { useIsDev } from '../DevelopmentContext'
import { useSatisfiesVersion } from './ExtensionVersionContext'

type MinimumVersionProps = PropsWithChildren<{
  version: string
  fallback?: ReactNode
}>

export const MinimumVersion = ({
  children,
  version,
  fallback = null,
}: MinimumVersionProps) => {
  const satisfiesVersion = useSatisfiesVersion(version)
  const isDev = useIsDev()

  if (isDev) {
    return (
      <div className="rounded border border-yellow-900/80">
        <Popover
          popover={
            <div className="flex items-center gap-2 p-2 text-xs uppercase">
              <span className="opacity-75">From version:</span>
              <span className="font-semibold">{version}</span>
            </div>
          }
        >
          {children}
        </Popover>
      </div>
    )
  }

  if (satisfiesVersion) {
    return children
  }

  return fallback
}
