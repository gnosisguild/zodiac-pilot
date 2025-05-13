import { ProvidePort } from '@/port-handling'
import { ProvideState, type State } from '@/state'
import { type PropsWithChildren } from 'react'

type RenderWraperProps = PropsWithChildren<{
  initialState?: State
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
