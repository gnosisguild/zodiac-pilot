import { ProvideCompanionAppContext } from '@/companion'
import { ProvideExecutionRoute } from '@/execution-routes'
import { ProvidePort } from '@/port-handling'
import { ProvideProvider } from '@/providers-ui'
import { ProvideState, type TransactionState } from '@/state'
import type { ExecutionRoute } from '@/types'
import { getCompanionAppUrl } from '@zodiac/env'
import { type PropsWithChildren } from 'react'

type RenderWraperProps = PropsWithChildren<{
  initialState?: TransactionState[]
  initialSelectedRoute?: ExecutionRoute | null
}>

export const RenderWrapper = ({
  children,
  initialState,
  initialSelectedRoute = null,
}: RenderWraperProps) => (
  <ProvideCompanionAppContext url={getCompanionAppUrl()}>
    <ProvidePort>
      <ProvideState initialState={initialState}>
        {initialSelectedRoute == null ? (
          children
        ) : (
          <ProvideExecutionRoute route={initialSelectedRoute}>
            <ProvideProvider>{children}</ProvideProvider>
          </ProvideExecutionRoute>
        )}
      </ProvideState>
    </ProvidePort>
  </ProvideCompanionAppContext>
)
