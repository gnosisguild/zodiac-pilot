import type { TaggedAccount } from '@/accounts'
import { invariant } from '@epic-web/invariant'
import { createContext, useContext, type PropsWithChildren } from 'react'

const Context = createContext<TaggedAccount | null>(null)

export const ProvideAccount = ({
  children,
  account,
}: PropsWithChildren<{ account: TaggedAccount }>) => (
  <Context value={account}>{children}</Context>
)

export const useAccount = () => {
  const account = useContext(Context)

  invariant(account != null, 'No active account')

  return account
}
