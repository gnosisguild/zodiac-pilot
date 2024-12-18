import { ProvideExecutionRoute } from '@/execution-routes'
import { ProvidePort } from '@/port-handling'
import { ProvideConnectProvider, ProvideInjectedWallet } from '@/providers'
import { ProvideProvider } from '@/providers-ui'
import { ProvideState, type TransactionState } from '@/state'
import type { Eip1193Provider, ExecutionRoute } from '@/types'
import { type PropsWithChildren } from 'react'
import { createMockRoute } from './creators'

type RenderWraperProps = PropsWithChildren<{
  initialState?: TransactionState[]
  initialSelectedRoute?: ExecutionRoute | null
  initialProvider?: Eip1193Provider
}>

export const RenderWrapper = ({
  children,
  initialState,
  initialSelectedRoute = createMockRoute(),
  initialProvider,
}: RenderWraperProps) => (
  <ProvidePort>
    <ProvideState initialState={initialState}>
      <ProvideConnectProvider initialProvider={initialProvider}>
        <ProvideInjectedWallet>
          {initialSelectedRoute == null ? (
            children
          ) : (
            <ProvideExecutionRoute route={initialSelectedRoute}>
              <ProvideProvider>{children}</ProvideProvider>
            </ProvideExecutionRoute>
          )}
        </ProvideInjectedWallet>
      </ProvideConnectProvider>
    </ProvideState>
  </ProvidePort>
)
