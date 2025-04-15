import { ProvidePort } from '@/port-handling'
import { ProvideState, type TransactionState } from '@/state'
import { type PropsWithChildren } from 'react'

type RenderWraperProps = PropsWithChildren<{
  initialState?: TransactionState[]
}>

export const RenderWrapper = ({
  children,
  initialState,
}: RenderWraperProps) => (
  // <ProvideCompanionAppContext url={getCompanionAppUrl()}>
  <ProvidePort>
    <ProvideState initialState={initialState}>{children}</ProvideState>
  </ProvidePort>
  // </ProvideCompanionAppContext>
)
