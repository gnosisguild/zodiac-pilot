import { ProvidePort } from '@/port-handling'
import { ProvideTransactions, type State } from '@/state'
import { type PropsWithChildren } from 'react'

type RenderWraperProps = PropsWithChildren<{
  initialState?: State
}>

export const RenderWrapper = ({
  children,
  initialState,
}: RenderWraperProps) => (
  <ProvidePort>
    <ProvideTransactions initialState={initialState}>
      {children}
    </ProvideTransactions>
  </ProvidePort>
)
