import { ConnectWallet } from '@/components'
import { ChainSelect, Route, Routes, Waypoint, Waypoints } from '@/routes-ui'
import { jsonRpcProvider, parseRouteData, parseTransactionData } from '@/utils'
import { invariant, invariantResponse } from '@epic-web/invariant'
import { EXPLORER_URL, getChainId } from '@zodiac/chains'
import {
  CompanionAppMessageType,
  type CompanionAppMessage,
} from '@zodiac/messages'
import { waitForMultisigExecution } from '@zodiac/safe'
import {
  Error,
  errorToast,
  Form,
  Labeled,
  PrimaryButton,
  Success,
  successToast,
} from '@zodiac/ui'
import { type Eip1193Provider } from 'ethers'
import {
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  SquareArrowOutUpRight,
} from 'lucide-react'
import { useState } from 'react'
import { useLoaderData } from 'react-router'
import {
  checkPermissions,
  execute,
  ExecutionActionType,
  planExecution,
  queryRoutes,
  unprefixAddress,
  type ExecutionPlan,
  type ExecutionState,
} from 'ser-kit'
import { useAccount, useConnectorClient } from 'wagmi'

import {
  extractTokenFlowsFromSimulation,
  simulateBundleTransaction,
  splitTokenFlows,
} from '@/simulation-server'
import type { Route as RouteType } from './+types/sign'
import { TokenTransferTable } from './TokenTransferTable'

export const loader = async ({ params }: RouteType.LoaderArgs) => {
  const metaTransactions = parseTransactionData(params.transactions)
  const { initiator, waypoints, ...route } = parseRouteData(params.route)

  invariantResponse(initiator != null, 'Route needs an initiator')
  invariantResponse(waypoints != null, 'Route does not provide any waypoints')

  const [plan, routes, permissionCheck, simulationResponse] = await Promise.all(
    [
      planExecution(metaTransactions, {
        initiator,
        waypoints,
        ...route,
      }),
      queryRoutes(unprefixAddress(initiator), route.avatar),
      checkPermissions(metaTransactions, { initiator, waypoints, ...route }),
      simulateBundleTransaction(
        metaTransactions.map((tx) => ({
          network_id: getChainId(route.avatar),
          from: unprefixAddress(route.avatar),
          to: tx.to,
          input: tx.data,
          value: tx.value.toString(),
          save: true,
          save_if_fails: true,
          simulation_type: 'full',
        })),
      ),
    ],
  )

  const tokenFlows = await extractTokenFlowsFromSimulation(simulationResponse)

  return {
    plan,
    isValidRoute: routes.length > 0,
    permissionCheck,
    id: route.id,
    initiator: unprefixAddress(initiator),
    waypoints,
    avatar: route.avatar,
    chainId: getChainId(route.avatar),
    tokenFlows: splitTokenFlows(tokenFlows, unprefixAddress(route.avatar)),
  }
}

const SubmitPage = ({
  loaderData: {
    initiator,
    chainId,
    id,
    avatar,
    waypoints,
    isValidRoute,
    permissionCheck,
    tokenFlows: { other, received, sent },
  },
}: RouteType.ComponentProps) => {
  return (
    <Form>
      <Form.Section
        title="Review account information"
        description="Please review the account information that will be used to sign this transaction bundle"
      >
        {!isValidRoute && (
          <Error title="Invalid route">
            You cannot sign this transaction as we could not find any route form
            the signer wallet to the account.
          </Error>
        )}

        <ChainSelect disabled defaultValue={chainId} />

        <Labeled label="Selected route">
          <Routes disabled orientation="horizontal">
            <Route id={id}>
              {waypoints && (
                <Waypoints>
                  {waypoints.map(({ account, ...waypoint }, index) => (
                    <Waypoint
                      key={`${account.address}-${index}`}
                      account={account}
                      connection={
                        'connection' in waypoint
                          ? waypoint.connection
                          : undefined
                      }
                    />
                  ))}
                </Waypoints>
              )}
            </Route>
          </Routes>
        </Labeled>
      </Form.Section>

      <Form.Section
        title="Token Flows"
        description="An overview of the tokens involved in this transaction bundle."
      >
        <TokenTransferTable
          title="Tokens Sent"
          columnTitle="To"
          avatar={avatar}
          icon={ArrowUpFromLine}
          tokens={sent}
        />

        <TokenTransferTable
          title="Tokens Received"
          columnTitle="From"
          avatar={avatar}
          icon={ArrowDownToLine}
          tokens={received}
        />

        <TokenTransferTable
          title="Other Token Movements"
          columnTitle="From → To"
          avatar={avatar}
          icon={ArrowLeftRight}
          tokens={other}
        />
      </Form.Section>

      <Form.Section
        title="Permissions check"
        description="We check whether any permissions on the current route would prevent this transaction from succeeding."
      >
        {permissionCheck.success ? (
          <Success title="All checks passed" />
        ) : (
          <Error title="Permission violation">{permissionCheck.error}</Error>
        )}
      </Form.Section>

      <Form.Section
        title="Signer details"
        description="Make sure that your connected wallet matches the signer that is configured for this account"
      >
        <ConnectWallet chainId={chainId} pilotAddress={initiator} />
      </Form.Section>

      <Form.Actions>
        <SubmitTransaction
          disabled={!isValidRoute || !permissionCheck.success}
        />
      </Form.Actions>
    </Form>
  )
}

export default SubmitPage

type SubmitTransactionProps = {
  disabled?: boolean
}

const SubmitTransaction = ({ disabled = false }: SubmitTransactionProps) => {
  const { plan, chainId, avatar, initiator } = useLoaderData<typeof loader>()
  const walletAccount = useAccount()
  const { data: connectorClient } = useConnectorClient()
  const [submitPending, setSubmitPending] = useState(false)

  if (
    disabled ||
    walletAccount.chainId !== chainId ||
    walletAccount.address?.toLowerCase() !== initiator.toLowerCase() ||
    connectorClient == null
  ) {
    return <PrimaryButton disabled>Sign</PrimaryButton>
  }

  return (
    <PrimaryButton
      busy={submitPending}
      onClick={async () => {
        invariant(connectorClient != null, 'Client must be ready')

        setSubmitPending(true)

        const state: ExecutionState = []

        try {
          await execute(
            plan as ExecutionPlan,
            state,
            connectorClient as Eip1193Provider,
            { origin: 'Zodiac Pilot' },
          )

          const safeTxHash =
            state[
              plan.findLastIndex(
                (action) =>
                  action.type === ExecutionActionType.PROPOSE_TRANSACTION,
              )
            ]
          const txHash =
            safeTxHash == null
              ? state[
                  plan.findLastIndex(
                    (action) =>
                      action.type === ExecutionActionType.EXECUTE_TRANSACTION,
                  )
                ]
              : undefined

          if (txHash) {
            console.debug(
              `Transaction batch has been submitted with transaction hash ${txHash}`,
            )
            const receipt =
              await jsonRpcProvider(chainId).waitForTransaction(txHash)
            console.debug(`Transaction ${txHash} has been executed`, receipt)
            successToast({
              title: 'Transaction batch has been executed',
              message: (
                <a
                  href={`${EXPLORER_URL[chainId]}/tx/${txHash}`}
                  className="inline-flex items-center gap-1"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <SquareArrowOutUpRight size={16} />
                  View in block explorer
                </a>
              ),
            })
          }

          if (safeTxHash) {
            console.debug(
              `Transaction batch has been proposed with safeTxHash ${safeTxHash}`,
            )

            const url = new URL('/transactions/tx', 'https://app.safe.global')

            url.searchParams.set('safe', avatar)
            url.searchParams.set(
              'id',
              `multisig_${unprefixAddress(avatar)}_${safeTxHash}`,
            )

            successToast({
              title: 'Transaction batch has been proposed for execution',
              message: (
                <a
                  href={url.toString()}
                  className="inline-flex items-center gap-1"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <SquareArrowOutUpRight size={16} />
                  {'View in Safe{Wallet}'}
                </a>
              ),
            })
            // In case the other safe owners are quick enough to sign while the Pilot session is still open, we can show a toast with an execution confirmation
            const txHash = await waitForMultisigExecution(chainId, safeTxHash)
            console.debug(
              `Proposed transaction batch with safeTxHash ${safeTxHash} has been confirmed and executed with transaction hash ${txHash}`,
            )
            successToast({
              title:
                'Proposed Safe transaction has been confirmed and executed',
              message: (
                <a
                  href={`${EXPLORER_URL[chainId]}/tx/${txHash}`}
                  className="inline-flex items-center gap-1"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <SquareArrowOutUpRight size={16} />
                  View in block explorer
                </a>
              ),
            })
          }

          window.postMessage({
            type: CompanionAppMessageType.SUBMIT_SUCCESS,
          } satisfies CompanionAppMessage)
        } catch {
          errorToast({
            title: 'Error',
            message: 'Submitting the transaction batch failed',
          })
        } finally {
          setSubmitPending(false)
        }
      }}
    >
      Sign
    </PrimaryButton>
  )
}
