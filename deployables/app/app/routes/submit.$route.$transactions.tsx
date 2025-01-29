import { ConnectWallet, Page, WalletProvider } from '@/components'
import { parseRouteData } from '@/utils'
import { invariant, invariantResponse } from '@epic-web/invariant'
import { getChainId } from '@zodiac/chains'
import { PrimaryButton } from '@zodiac/ui'
import type { Eip1193Provider } from 'ethers'
import { useLoaderData } from 'react-router'
import {
  execute,
  parsePrefixedAddress,
  planExecution,
  type ExecutionPlan,
  type ExecutionState,
  type MetaTransactionRequest,
} from 'ser-kit'
import { useConnectorClient } from 'wagmi'
import type { Route } from './+types/submit.$route.$transactions'

export const loader = async ({ params }: Route.LoaderArgs) => {
  const metaTransactions = JSON.parse(
    atob(params.transactions),
  ) as MetaTransactionRequest[]
  const route = parseRouteData(params.route)

  invariantResponse(route.initiator != null, 'Route needs an initiator')

  // @ts-expect-error Bla
  const plan = await planExecution(metaTransactions, route)
  return {
    plan,
    initiator: parsePrefixedAddress(route.initiator),
    chainId: getChainId(route.avatar),
  }
}

const SubmitPage = ({
  loaderData: { initiator, chainId },
}: Route.ComponentProps) => {
  return (
    <Page>
      <Page.Header>Submit</Page.Header>

      <Page.Main>
        <WalletProvider>
          <ConnectWallet
            chainId={chainId}
            pilotAddress={initiator}
            onConnect={() => {}}
            onDisconnect={() => {}}
          />

          <SubmitTransaction />
        </WalletProvider>
      </Page.Main>
    </Page>
  )
}

export default SubmitPage

const SubmitTransaction = () => {
  const { plan } = useLoaderData<typeof loader>()

  const { data: connectorClient } = useConnectorClient()

  const submit = async () => {
    invariant(connectorClient != null, 'Client must be ready')
    const state = [] as ExecutionState
    await execute(
      plan as ExecutionPlan,
      state,
      connectorClient as Eip1193Provider,
      { origin: 'Zodiac Pilot' },
    )
  }

  return (
    <PrimaryButton disabled={!connectorClient} onClick={submit}>
      Sign
    </PrimaryButton>
  )
}
