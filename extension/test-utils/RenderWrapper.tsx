import { ProvideExecutionRoute } from '@/execution-routes'
import { ProvideBridgeContext } from '@/inject-bridge'
import { ProvideConnectProvider, ProvideInjectedWallet } from '@/providers'
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
      <ProvideConnectProvider>
        <ProvideInjectedWallet>
          <ProvideExecutionRoute route={initialSelectedRoute}>
            <ProvideProvider>{children}</ProvideProvider>
          </ProvideExecutionRoute>
        </ProvideInjectedWallet>
      </ProvideConnectProvider>
    </ProvideState>
  </ProvideBridgeContext>
)
