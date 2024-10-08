import { createContext, PropsWithChildren, useContext } from 'react'
import { Chain, PublicClient, WalletClient } from 'viem'
import { useConfig } from 'wagmi'

type ClientFnOptions = { chain: Chain }
type ClientFn = (options: ClientFnOptions) => PublicClient | WalletClient

const ConfigContext = createContext<{
  client: ClientFn
}>({
  client() {
    throw new Error('No client configuration found on context.')
  },
})

type ProvideConfigProps = PropsWithChildren<{
  client: ClientFn
}>

export const ProvideConfig = ({ children, client }: ProvideConfigProps) => {
  return (
    <ConfigContext.Provider value={{ client }}>
      {children}
    </ConfigContext.Provider>
  )
}

export const useWagmiConfig = () => {
  const config = useConfig()
  const { client } = useContext(ConfigContext)

  return { ...config, client }
}
