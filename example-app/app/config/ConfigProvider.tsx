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
      // @ts-expect-error Something around chain that hopefully isn't important
      getClient: (options) => {
        const chain = getChain(config.chains, options)

        invariant(chain != null, `Could not find chain with id`)

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

type GetChainOptions = { chainId?: number }

const getChain = (
  chains: Config['chains'],
  { chainId }: GetChainOptions = {},
) => {
  if (chainId == null) {
    return chains.at(0)
  }

  return chains.find((chain) => chain.id === chainId)
}
