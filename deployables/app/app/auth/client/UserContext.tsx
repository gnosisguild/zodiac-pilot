import type { User } from '@zodiac/db/schema'
import { createContext, useContext, type PropsWithChildren } from 'react'

const UserContext = createContext<User | null>(null)

export const ProvideUser = ({
  user,
  children,
}: PropsWithChildren<{ user: User | null }>) => (
  <UserContext value={user}>{children}</UserContext>
)

export const useUser = () => useContext(UserContext)

export const useIsSignedIn = () => useUser() != null
