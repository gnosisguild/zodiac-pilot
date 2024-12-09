import { ProvideExecutionRoutes } from '@/execution-routes'
import { ProvideBridgeContext } from '@/inject-bridge'
import { ProvideInjectedWallet } from '@/providers'
import { ProvideProvider } from '@/providers-ui'
import { ProvideState, type TransactionState } from '@/state'
import type { PropsWithChildren } from 'react'

type RenderWraperProps = PropsWithChildren<{
  windowId?: number
  initialState?: TransactionState[]
}>

export const RenderWrapper = ({
  children,
  windowId = 1,
  initialState,
}: RenderWraperProps) => (
  <ProvideBridgeContext windowId={windowId}>
    <ProvideState initialState={initialState}>
      <ProvideInjectedWallet>
        <ProvideProvider>
          <ProvideExecutionRoutes>{children}</ProvideExecutionRoutes>
        </ProvideProvider>
      </ProvideInjectedWallet>
    </ProvideState>
  </ProvideBridgeContext>
)
