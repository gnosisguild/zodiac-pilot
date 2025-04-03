import type { User } from '@workos-inc/node'
import type { PropsWithChildren } from 'react'
import { OnlyConnected } from './OnlyConnected'

type OnlyConnectedWhenLoggedOutProps = PropsWithChildren<{
  user: User | null
}>

export const OnlyConnectedWhenLoggedOut = ({
  user,
  children,
}: OnlyConnectedWhenLoggedOutProps) => {
  if (user == null) {
    return <OnlyConnected>{children}</OnlyConnected>
  }

  return children
}
