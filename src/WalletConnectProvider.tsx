import WalletConnectEthereumProvider from '@walletconnect/ethereum-provider'
import React, { useContext, useEffect, useState } from 'react'
interface Context {
  provider?: WalletConnectEthereumProvider
  connected: boolean
}

const WalletConnectContext = React.createContext<Context>({ connected: false })

interface Result {
  provider: WalletConnectEthereumProvider
  connected: boolean
}

export const useWalletConnectProvider = (): Result => {
  const context = useContext(WalletConnectContext)
  if (!context.provider) {
    throw new Error('must be wrapped by <WalletConnectProvider>')
  }
  return context as Result
}

const WalletConnectProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<Context>({ connected: false })
  useEffect(() => {
    async function init() {
      const provider = new WalletConnectEthereumProvider({
        infuraId: 'e301e57e9a51407eb39df231874e0563', // TODO: invalidate this ID soon!
      })
      // @ts-expect-error signer is a private property, but we didn't find another way
      provider.signer.on('connect', () => {
        console.log('WalletConnect connected')
        setState({ provider, connected: true })
      })

      provider.on('disconnect', () => {
        console.log('WalletConnect disconnected')
        setState({ provider, connected: false })
      })

      setState({ provider, connected: provider.connected })
    }

    init()
  }, [])

  if (!state.provider) {
    return null
  }

  return (
    <WalletConnectContext.Provider value={state}>
      {children}
    </WalletConnectContext.Provider>
  )
}
export default WalletConnectProvider
