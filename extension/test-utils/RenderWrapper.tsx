import {
  ProvideExecutionRoute,
  ProvideExecutionRoutes,
} from '@/execution-routes'
import { ProvideBridgeContext } from '@/inject-bridge'
import { ProvideInjectedWallet } from '@/providers'
import { ProvideProvider } from '@/providers-ui'
import { ProvideState, type TransactionState } from '@/state'
import type { ExecutionRoute } from '@/types'
import type { PropsWithChildren } from 'react'
import { createMockRoute } from './creators'

type RenderWraperProps = PropsWithChildren<{
  windowId?: number
  initialState?: TransactionState[]
  initialSelectedRoute?: ExecutionRoute
}>

export const RenderWrapper = ({
  children,
  windowId = 1,
  initialState,
  initialSelectedRoute = createMockRoute(),
}: RenderWraperProps) => (
  <ProvideBridgeContext windowId={windowId}>
    <ProvideState initialState={initialState}>
      <ProvideInjectedWallet>
        <ProvideExecutionRoute route={initialSelectedRoute}>
          <ProvideProvider>
            <ProvideExecutionRoutes>{children}</ProvideExecutionRoutes>
          </ProvideProvider>
        </ProvideExecutionRoute>
      </ProvideInjectedWallet>
    </ProvideState>
  </ProvideBridgeContext>
)
