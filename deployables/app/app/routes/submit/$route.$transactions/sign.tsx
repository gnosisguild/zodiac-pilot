import { ConnectWallet } from '@/components'
import {
  ChainSelect,
  Route,
  Routes,
  TokenTransferTable,
  Waypoint,
  Waypoints,
} from '@/routes-ui'
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
  Info,
  Labeled,
  PrimaryButton,
  SecondaryLinkButton,
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
import { useState, type JSX } from 'react'
import { href, Outlet, useLoaderData, useNavigation } from 'react-router'
import {
  checkPermissions,
  execute,
  ExecutionActionType,
  planExecution,
  queryRoutes,
  splitPrefixedAddress,
  unprefixAddress,
  type ExecutionPlan,
  type ExecutionState,
} from 'ser-kit'
import { useAccount, useConnectorClient } from 'wagmi'

import { type TokenTransfer } from '@/balances-client'
import {
  extractTokenFlowsFromSimulation,
  simulateBundleTransaction,
  splitTokenFlows,
  type SimulationParams,
} from '@/simulation-server'
import type { Route as RouteType } from './+types/sign'

export const loader = async ({ params }: RouteType.LoaderArgs) => {
  const metaTransactions = parseTransactionData(params.transactions)
  const { initiator, waypoints, ...route } = parseRouteData(params.route)

  invariantResponse(initiator != null, 'Route needs an initiator')
  invariantResponse(waypoints != null, 'Route does not provide any waypoints')

  const [chainId, avatarAddress] = splitPrefixedAddress(route.avatar)

  const simulationParams: SimulationParams[] = metaTransactions.map((tx) => ({
    network_id: chainId ?? 1,
    from: avatarAddress,
    to: tx.to,
    input: tx.data,
    value: tx.value.toString(),
    save: true,
    save_if_fails: true,
    simulation_type: 'full',
  }))

  const [plan, routes, permissionCheck, simulationResponse] = await Promise.all(
    [
      planExecution(metaTransactions, {
        initiator,
        waypoints,
        ...route,
      }),
      queryRoutes(unprefixAddress(initiator), route.avatar),
      checkPermissions(metaTransactions, { initiator, waypoints, ...route }),
      simulateBundleTransaction(simulationParams),
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
    tokenFlows,
    avatarAddress,
  }
}

const SubmitPage = ({
  loaderData: {
    initiator,
    chainId,
    id,
    waypoints,
    isValidRoute,
    permissionCheck,
    tokenFlows,
    avatarAddress,
  },
  params: { route, transactions },
}: RouteType.ComponentProps) => {
  const { location, formData } = useNavigation()
  const { sent, received, other } = splitTokenFlows(tokenFlows, avatarAddress)
  return (
    <>
      <Form>
        <Form.Section
          title="Review account information"
          description="Please review the account information that will be used to sign this transaction bundle"
        >
          {!isValidRoute && (
            <Error title="Invalid route">
              You cannot sign this transaction as we could not find any route
              form the signer wallet to the account.
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

            <div className="flex justify-end">
              <SecondaryLinkButton
                disabled={!isValidRoute}
                busy={location != null && formData == null}
                to={href('/submit/:route/:transactions/update-route', {
                  route,
                  transactions,
                })}
              >
                Select a different route
              </SecondaryLinkButton>
            </div>
          </Labeled>
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

        {tokenFlows.length === 0 ? (
          <Info title="Nothing to show">
            We could not find any token flows for this transaction.
          </Info>
        ) : (
          <Form.Section
            title="Token Flows"
            description="An overview of the tokens involved in this transaction bundle."
          >
            <TokenFlowSection
              title="Tokens Sent"
              icon={<ArrowUpFromLine className="h-4 w-4" />}
              flows={sent}
            />
            <TokenFlowSection
              title="Tokens Received"
              icon={<ArrowDownToLine className="h-4 w-4" />}
              flows={received}
            />
            <TokenFlowSection
              title="Other Token Movements"
              icon={<ArrowLeftRight className="h-4 w-4" />}
              flows={other}
            />
          </Form.Section>
        )}

        <Form.Actions>
          <SubmitTransaction
            disabled={!isValidRoute || !permissionCheck.success}
          />
        </Form.Actions>
      </Form>

      <Outlet />
    </>
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

type TokenFlowSectionProps = {
  title: string
  flows: TokenTransfer[]
  icon: JSX.Element
}

const TokenFlowSection = ({ title, flows, icon }: TokenFlowSectionProps) => {
  if (flows.length === 0) {
    return null
  }

  return (
    <div className="mb-4">
      <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold dark:text-zinc-50">
        {icon} {title}
      </h3>
      <TokenTransferTable title={title} tokens={flows} />
    </div>
  )
}
