import React, { ReactNode, useContext } from 'react'

import IframeBridgeProvider, {
  IframeBridgeProviderInstance,
} from './IframeBridgeProvider'

const MetamaskContext =
  React.createContext<IframeBridgeProviderInstance | null>(null)

export const useMetamask = () => {
  const instance = useContext(MetamaskContext)
  if (!instance) {
    throw new Error('useMetamask must be used within a <ProvideMetamask>')
  }
  return instance
}

const ProvideMetamask: React.FC<{ children: ReactNode }> = ({ children }) => (
  <IframeBridgeProvider
    name="metamask-frame"
    contextProvider={MetamaskContext.Provider}
  >
    {children}
  </IframeBridgeProvider>
)

export default ProvideMetamask
