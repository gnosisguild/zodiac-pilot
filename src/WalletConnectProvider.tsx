import WalletConnectEthereumProvider from '@walletconnect/ethereum-provider'
import React, { useContext, useEffect, useState } from 'react'

const WalletConnectContext = React.createContext<
  WalletConnectEthereumProvider | undefined
>(undefined)

export const useWalletConnectClient = (): WalletConnectEthereumProvider => {
  const provider = useContext(WalletConnectContext)
  if (!provider) {
    throw new Error('must be wrapped by <WalletConnectProvider>')
  }
  return provider
}

const WalletConnectProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [provider, setProvider] = useState<
    WalletConnectEthereumProvider | undefined
  >(undefined)

  useEffect(() => {
    async function init() {
      const provider = new WalletConnectEthereumProvider({
        infuraId: 'e301e57e9a51407eb39df231874e0563', // TODO: invalidate this ID soon!
      })
      await provider.enable()
      setProvider(provider)
    }

    init()
  }, [])

  if (!provider) {
    return <span>Loading...</span>
  }

  return (
    <WalletConnectContext.Provider value={provider}>
      {children}
    </WalletConnectContext.Provider>
  )
}
export default WalletConnectProvider
