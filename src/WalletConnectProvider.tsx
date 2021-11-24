import WalletConnectWeb3Provider from '@walletconnect/web3-provider'
import { providers } from 'ethers'
import React, { useContext, useEffect, useState } from 'react'

const WalletConnectContext = React.createContext<
  providers.Web3Provider | undefined
>(undefined)

export const useWalletConnectClient = (): providers.Web3Provider => {
  const value = useContext(WalletConnectContext)
  if (!value) throw new Error('must be wrapped by <WalletConnectProvider>')
  return value
}

const WalletConnectProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [provider, setProvider] = useState<providers.Web3Provider | undefined>(
    undefined
  )

  useEffect(() => {
    async function init() {
      const walletConnectProvider = new WalletConnectWeb3Provider({
        infuraId: 'e301e57e9a51407eb39df231874e0563',
      })
      await walletConnectProvider.enable()

      setProvider(new providers.Web3Provider(walletConnectProvider))
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
