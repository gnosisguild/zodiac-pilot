import { ProvideBridgeContext } from '@/bridge'
import { ProvideInjectedWallet } from '@/providers'
import { ProvideProvider } from '@/providers-ui'
import { ProvideState } from '@/state'
import { ProvideZodiacRoutes } from '@/zodiac-routes'
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
          <ProvideZodiacRoutes>{children}</ProvideZodiacRoutes>
        </ProvideProvider>
      </ProvideInjectedWallet>
    </ProvideState>
  </ProvideBridgeContext>
)
