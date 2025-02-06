import { createContext, useContext, type PropsWithChildren } from 'react'

const DevelopmentContext = createContext(false)

export const ProvideDevelopmentContext = ({
  children,
  isDev,
}: PropsWithChildren<{ isDev: boolean }>) => (
  <DevelopmentContext value={isDev}>{children}</DevelopmentContext>
)

export const useIsDev = () => useContext(DevelopmentContext)
