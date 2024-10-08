import { invariant } from '@epic-web/invariant'
import { createContext, PropsWithChildren, useContext } from 'react'
import { Chain, PublicClient, WalletClient } from 'viem'
import { Config, useConfig } from 'wagmi'

type ClientFnOptions = { chain: Chain }
type ClientFn = (options: ClientFnOptions) => PublicClient | WalletClient

const ConfigContext = createContext<{
  client: ClientFn
  scopeKey: string | null
}>({
  client() {
    throw new Error('No client configuration found on context.')
  },
  scopeKey: null,
})

type ProvideConfigProps = PropsWithChildren<{
  client: ClientFn
  scopeKey: string
}>

export const ProvideConfig = ({
  children,
  client,
  scopeKey,
}: ProvideConfigProps) => {
  return (
    <ConfigContext.Provider value={{ client, scopeKey }}>
      {children}
    </ConfigContext.Provider>
  )
}

export const useWagmiConfig = (): [config: Config, scopeKey: string] => {
  const config = useConfig()
  const { client } = useContext(ConfigContext)

  return [
    {
      ...config,
      getClient: ({ chainId }) => {
        const chain = config.chains.find((chain) => chain.id === chainId)

        invariant(chain != null, `Could not find chain with id "${chainId}"`)

        return client({ chain })
      },
    },
    useConfigScope(),
  ] as const
}

const useConfigScope = () => {
  const { scopeKey } = useContext(ConfigContext)

  invariant(scopeKey != null, 'No "scopeKey" found on context')

  return scopeKey
}
