import { ProvideCompanionAppContext } from '@/companion'
import { ProvideExecutionRoute } from '@/execution-routes'
import { ProvidePort } from '@/port-handling'
import { ProvideProvider } from '@/providers-ui'
import { ProvideState, type TransactionState } from '@/state'
import type { ExecutionRoute } from '@/types'
import { type PropsWithChildren } from 'react'

type RenderWraperProps = PropsWithChildren<{
  initialState?: TransactionState[]
  initialSelectedRoute?: ExecutionRoute | null
  companionAppUrl?: string
}>

export const RenderWrapper = ({
  children,
  initialState,
  initialSelectedRoute = null,
  companionAppUrl = 'http://localhost:3040',
}: RenderWraperProps) => (
  <ProvideCompanionAppContext url={companionAppUrl}>
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
