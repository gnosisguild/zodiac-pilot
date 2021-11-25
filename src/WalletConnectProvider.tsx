import { IConnector } from '@walletconnect/types'
import WalletConnectWeb3Provider from '@walletconnect/web3-provider'
import { providers } from 'ethers'
import React, { useContext, useEffect, useState } from 'react'

interface ConnectorState {
  provider: providers.Web3Provider | undefined
  connector: IConnector | undefined
}

const WalletConnectContext = React.createContext<ConnectorState>({
  provider: undefined,
  connector: undefined,
})

export const useWalletConnectClient = (): ConnectorState => {
  const { provider, connector } = useContext(WalletConnectContext)
  if (!provider || !connector) {
    throw new Error('must be wrapped by <WalletConnectProvider>')
  }
  return { provider, connector }
}

const WalletConnectProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [{ provider, connector }, setState] = useState<ConnectorState>({
    provider: undefined,
    connector: undefined,
  })

  useEffect(() => {
    async function init() {
      const walletConnectProvider = new WalletConnectWeb3Provider({
        infuraId: 'e301e57e9a51407eb39df231874e0563',
      })
      await walletConnectProvider.enable()

      const connector = await walletConnectProvider.getWalletConnector()

      setState({
        provider: new providers.Web3Provider(walletConnectProvider),
        connector,
      })
    }

    init()
  }, [])

  if (!provider) {
    return <span>Loading...</span>
  }

  return (
    <WalletConnectContext.Provider value={{ provider, connector }}>
      {children}
    </WalletConnectContext.Provider>
  )
}
export default WalletConnectProvider
