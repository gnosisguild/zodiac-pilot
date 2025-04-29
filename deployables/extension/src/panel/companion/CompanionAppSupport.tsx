import { invariant } from '@epic-web/invariant'
import { createContext, useContext, type PropsWithChildren } from 'react'
import type { User } from './getUser'

const CompanionAppContext = createContext<{
  url: string | null
  user: User | null
}>({ url: null, user: null })

type CompanionAppProps = PropsWithChildren<{
  url: string
  user: User | null
}>

export const ProvideCompanionAppContext = ({
  children,
  url,
  user,
}: CompanionAppProps) => (
  <CompanionAppContext value={{ url, user }}>{children}</CompanionAppContext>
)

export const useCompanionAppUrl = () => {
  const { url } = useContext(CompanionAppContext)

  invariant(url != null, 'Companion app URL could not be found on context')

  return url
}

export const useCompanionAppUser = () => {
  const { user } = useContext(CompanionAppContext)

  return user
}
