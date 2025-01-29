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
          <ConnectWallet chainId={chainId} pilotAddress={initiator} />

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

    await execute(
      plan as ExecutionPlan,
      [] as ExecutionState,
      connectorClient as Eip1193Provider,
      { origin: 'Zodiac Pilot' },
    )
  }

  return (
    <PrimaryButton disabled={connectorClient == null} onClick={submit}>
      Sign
    </PrimaryButton>
  )
}

// STUFF THAT HAPPENED

// if (!connected) {
//   invariant(connect != null, 'No connect method present')
//   const success = await connect()
//   if (!success) {
//     const chainName = CHAIN_NAME[chainId] || `#${chainId}`
//     errorToast({
//       title: 'Error',
//       message: `Switch your wallet to ${chainName} to submit the transactions`,
//     })
//     return
//   }
// }
// invariant(submitTransactions != null, 'Cannot submit transactions')
// let result: {
//   txHash?: `0x${string}`
//   safeTxHash?: `0x${string}`
// }
// try {
//   result = await submitTransactions()
// } catch (e) {
//   console.warn(e)
//   setSubmitPending(false)
//   const err = e as JsonRpcError
//   errorToast({
//     title: 'Submitting the transaction batch failed',
//     message: name,
//   })
//   return
// }
// setSubmitPending(false)
// const { txHash, safeTxHash } = result
// if (txHash) {
//   console.debug(
//     `Transaction batch has been submitted with transaction hash ${txHash}`,
//   )
//   const receipt =
//     await getReadOnlyProvider(chainId).waitForTransaction(txHash)
//   console.debug(`Transaction ${txHash} has been executed`, receipt)
//   successToast({
//     title: 'Transaction batch has been executed',
//     message: (
//       <a
//         href={`${EXPLORER_URL[chainId]}/tx/${txHash}`}
//         className="inline-flex items-center gap-1"
//         target="_blank"
//         rel="noopener noreferrer"
//       >
//         <SquareArrowOutUpRight size={16} />
//         View in block explorer
//       </a>
//     ),
//   })
// }
// if (safeTxHash) {
//   console.debug(
//     `Transaction batch has been proposed with safeTxHash ${safeTxHash}`,
//   )
//   const avatarAddress = parsePrefixedAddress(avatar)
//   successToast({
//     title: 'Transaction batch has been proposed for execution',
//     message: (
//       <a
//         href={`https://app.safe.global/transactions/tx?safe=${avatar}&id=multisig_${avatarAddress}_${safeTxHash}`}
//         className="inline-flex items-center gap-1"
//         target="_blank"
//         rel="noopener noreferrer"
//       >
//         <SquareArrowOutUpRight size={16} />
//         {'View in Safe{Wallet}'}
//       </a>
//     ),
//   })
//   // In case the other safe owners are quick enough to sign while the Pilot session is still open, we can show a toast with an execution confirmation
//   const txHash = await waitForMultisigExecution(chainId, safeTxHash)
//   console.debug(
//     `Proposed transaction batch with safeTxHash ${safeTxHash} has been confirmed and executed with transaction hash ${txHash}`,
//   )
//   successToast({
//     title: 'Proposed Safe transaction has been confirmed and executed',
//     message: (
//       <a
//         href={`${EXPLORER_URL[chainId]}/tx/${txHash}`}
//         className="inline-flex items-center gap-1"
//         target="_blank"
//         rel="noopener noreferrer"
//       >
//         <SquareArrowOutUpRight size={16} />
//         View in block explorer
//       </a>
//     ),
//   })
// }
