import { ProvideBridgeContext } from '@/bridge'
import { ProvideInjectedWallet, ProvideProvider } from '@/providers'
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
  <ProvideState>
    <ProvideInjectedWallet>
      <ProvideProvider>
        <ProvideZodiacRoutes>
          <ProvideBridgeContext windowId={windowId}>
            {children}
          </ProvideBridgeContext>
        </ProvideZodiacRoutes>
      </ProvideProvider>
    </ProvideInjectedWallet>
  </ProvideState>
)
