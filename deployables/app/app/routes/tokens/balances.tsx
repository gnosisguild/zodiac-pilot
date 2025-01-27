import { Page } from '@/components'
import Moralis from 'moralis'
import { useEffect } from 'react'
import { useFetcher } from 'react-router'
import { useAccount } from 'wagmi'
import type { Route } from './+types/balances'

export const meta: Route.MetaFunction = () => [{ title: 'Pilot | Balances' }]

const Balances = () => {
  const { address, chainId } = useAccount()
  const { load, data } =
    useFetcher<
      Awaited<
        ReturnType<typeof Moralis.EvmApi.wallets.getWalletTokenBalancesPrice>
      >
    >()

  useEffect(() => {
    if (address == null || chainId == null) {
      return
    }

    load(`/${address}/${chainId}/balances`)
  }, [address, chainId, load])

  return (
    <Page>
      <Page.Header>Balances</Page.Header>

      <Page.Main></Page.Main>
    </Page>
  )
}

export default Balances
