import { invariant } from '@epic-web/invariant'
import { createContext, useContext, type PropsWithChildren } from 'react'

const CompanionAppContext = createContext<string | null>(null)

type CompanionAppProps = PropsWithChildren<{
  url: string
}>

export const ProvideCompanionAppContext = ({
  children,
  url,
}: CompanionAppProps) => (
  <CompanionAppContext value={url}>{children}</CompanionAppContext>
)

export const useCompanionAppUrl = () => {
  const url = useContext(CompanionAppContext)

  invariant(url != null, 'Companion app URL could not be found on context')

  return url
}
