import { invariant } from '@epic-web/invariant'
import type { User } from '@zodiac/db/schema'
import { createContext, useContext, type PropsWithChildren } from 'react'

const UserContext = createContext<User | null>(null)

export const ProvideUser = ({
  user,
  children,
}: PropsWithChildren<{ user: User }>) => (
  <UserContext value={user}>{children}</UserContext>
)

export const useUser = () => {
  const user = useContext(UserContext)

  invariant(user != null, 'No active user found')

  return user
}

export const useIsSignedIn = () => {
  const user = useContext(UserContext)

  return user != null
}
