import { ProvideExecutionRoutes } from '@/execution-routes'
import { ProvideBridgeContext } from '@/inject-bridge'
import { ProvideInjectedWallet } from '@/providers'
import { ProvideProvider } from '@/providers-ui'
import { ProvideState } from '@/state'
import { PropsWithChildren } from 'react'

type RenderWraperProps = PropsWithChildren<{
  windowId?: number
}>

export const RenderWrapper = ({
  children,
  windowId = 1,
}: RenderWraperProps) => (
  <ProvideBridgeContext windowId={windowId}>
    <ProvideState>
      <ProvideInjectedWallet>
        <ProvideProvider>
          <ProvideExecutionRoutes>{children}</ProvideExecutionRoutes>
        </ProvideProvider>
      </ProvideInjectedWallet>
    </ProvideState>
  </ProvideBridgeContext>
)
