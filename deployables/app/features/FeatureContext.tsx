import { createContext, useContext, type PropsWithChildren } from 'react'

const FeatureContext = createContext<string[]>([])

type FeatureProviderProps = PropsWithChildren<{ features: string[] }>

export const FeatureProvider = ({
  features,
  children,
}: FeatureProviderProps) => (
  <FeatureContext value={features}>{children}</FeatureContext>
)

export const useFeatures = () => useContext(FeatureContext)
