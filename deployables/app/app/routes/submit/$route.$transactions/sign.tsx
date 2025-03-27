import { ConnectWallet } from '@/components'
import { useIsPending } from '@/hooks'
import { ChainSelect, Route, Routes, Waypoint, Waypoints } from '@/routes-ui'
import { simulateTransactionBundle } from '@/simulation-server'
import {
  jsonRpcProvider,
  parseRouteData,
  parseTransactionData,
  routeTitle,
} from '@/utils'
import { invariantResponse } from '@epic-web/invariant'
import { EXPLORER_URL, getChainId } from '@zodiac/chains'
import { getBoolean } from '@zodiac/form-data'
import {
  CompanionAppMessageType,
  type CompanionAppMessage,
} from '@zodiac/messages'
import { checkPermissions, queryRoutes } from '@zodiac/modules'
import { waitForMultisigExecution } from '@zodiac/safe'
import {
  Checkbox,
  Error,
  errorToast,
  Form,
  Labeled,
  PrimaryButton,
  SkeletonText,
  Success,
  successToast,
  Warning,
} from '@zodiac/ui'
import { type Eip1193Provider } from 'ethers'
import {
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  SquareArrowOutUpRight,
} from 'lucide-react'
import { Suspense, useEffect } from 'react'
import { Await, useActionData, useLoaderData } from 'react-router'
import {
  execute,
  ExecutionActionType,
  planExecution,
  unprefixAddress,
  type ExecutionState,
} from 'ser-kit'
import { useAccount, useConnectorClient } from 'wagmi'
import type { Route as RouteType } from './+types/sign'
import { appendApprovalTransactions } from './helper'
import { SkeletonFlowTable } from './SkeletonFlowTable'
import { TokenTransferTable } from './TokenTransferTable'

export const meta: RouteType.MetaFunction = ({ matches }) => [
  { title: routeTitle(matches, 'Sign transaction bundle') },
]

export const loader = async ({ params }: RouteType.LoaderArgs) => {
  const metaTransactions = parseTransactionData(params.transactions)
  const route = parseRouteData(params.route)

  invariantResponse(route.initiator != null, 'Route needs an initiator')
  invariantResponse(
    route.waypoints != null,
    'Route does not provide any waypoints',
  )

  const [queryRoutesResult, permissionCheckResult] = await Promise.all([
    queryRoutes(route.initiator, route.avatar),
    checkPermissions(route, metaTransactions),
  ])

  const simulate = async () => {
    const { tokenFlows, approvalTransactions } =
      await simulateTransactionBundle(route.avatar, metaTransactions)

    return { tokenFlows, hasApprovals: approvalTransactions.length > 0 }
  }

  return {
    isValidRoute:
      queryRoutesResult.error != null || queryRoutesResult.routes.length > 0,
    hasQueryRoutesError: queryRoutesResult.error != null,
    id: route.id,
    initiator: unprefixAddress(route.initiator),
    avatar: route.avatar,
    chainId: getChainId(route.avatar),
    simulation: simulate(),
    permissionCheck: permissionCheckResult.permissionCheck,
    passesPermissionCheck:
      permissionCheckResult.permissionCheck == null ||
      permissionCheckResult.permissionCheck.success,
    waypoints: route.waypoints,
    metaTransactions,
  }
}

export const action = async ({ params, request }: RouteType.ActionArgs) => {
  const metaTransactions = parseTransactionData(params.transactions)

  const { initiator, waypoints, ...route } = parseRouteData(params.route)

  invariantResponse(initiator != null, 'Route needs an initiator')
  invariantResponse(waypoints != null, 'Route does not provide any waypoints')

  const { approvalTransactions } = await simulateTransactionBundle(
    route.avatar,
    metaTransactions,
    { omitTokenFlows: true },
  )

  if (approvalTransactions.length > 0) {
    const data = await request.formData()
    const revokeApprovals = getBoolean(data, 'revokeApprovals')

    if (revokeApprovals) {
      return {
        plan: await planExecution(
          appendApprovalTransactions(metaTransactions, approvalTransactions),
          {
            initiator,
            waypoints,
            ...route,
          },
        ),
      }
    }
  }

  return {
    plan: await planExecution(metaTransactions, {
      initiator,
      waypoints,
      ...route,
    }),
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
    simulation,
    hasQueryRoutesError,
    passesPermissionCheck,
  },
}: RouteType.ComponentProps) => {
  return (
    <Form>
      <Form.Section
        title="Review token flows"
        description="Simulating the transaction bundle "
      >
        <Suspense fallback={<SkeletonFlowTable />}>
          <Await resolve={simulation}>
            {({ tokenFlows: { sent, received, other } }) => (
              <>
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
              </>
            )}
          </Await>
        </Suspense>
      </Form.Section>

      <Form.Section
        title="Review approvals"
        description="Token approvals let other addresses spend your tokens. If you don't
            revoke them, they can keep spending indefinitely."
      >
        <Suspense fallback={<SkeletonText />}>
          <Await resolve={simulation}>
            {({ hasApprovals }) =>
              hasApprovals ? (
                <Checkbox label="Revoke all approvals" name="revokeApprovals" />
              ) : (
                <Success title="No approval to revoke" />
              )
            }
          </Await>
        </Suspense>
      </Form.Section>

      <Form.Section
        title="Permission check"
        description="We check whether any permissions on the current route would prevent this transaction from succeeding."
      >
        {permissionCheck == null ? (
          <Warning title="Permissions backend unavailable">
            We could not check the permissions for this route. Proceed with
            caution.
          </Warning>
        ) : (
          <>
            {permissionCheck.success ? (
              <Success title="All checks passed" />
            ) : (
              <Error title="Permission violation">
                {permissionCheck.error}
              </Error>
            )}
          </>
        )}
      </Form.Section>

      <Form.Section
        title="Review account information"
        description="Please review the account information that will be used to sign this transaction bundle"
      >
        {!isValidRoute && (
          <Error title="Invalid route">
            We could not find any route form the signer wallet to the account.
            Proceed with caution.
          </Error>
        )}

        {hasQueryRoutesError && (
          <Warning title="Routes backend unavailable">
            We could not verify the currently selected route. Please proceed
            with caution.
          </Warning>
        )}

        <ChainSelect disabled defaultValue={chainId} />

        <Labeled label="Execution route">
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
        title="Signer details"
        description="Make sure that your connected wallet matches the signer that is configured for this account"
      >
        <ConnectWallet chainId={chainId} pilotAddress={initiator} />
      </Form.Section>

      <Form.Actions>
        <SubmitTransaction disabled={!passesPermissionCheck} />
      </Form.Actions>
    </Form>
  )
}

export default SubmitPage

type SubmitTransactionProps = {
  disabled?: boolean
}

const SubmitTransaction = ({ disabled = false }: SubmitTransactionProps) => {
  const { chainId, avatar, initiator } = useLoaderData<typeof loader>()
  const walletAccount = useAccount()
  const { data: connectorClient } = useConnectorClient()

  const actionData = useActionData<typeof action>()

  useEffect(() => {
    if (actionData == null) {
      return
    }

    const { plan } = actionData

    const executePlan = async () => {
      const state: ExecutionState = []

      try {
        await execute(plan, state, connectorClient as Eip1193Provider, {
          origin: 'Zodiac Pilot',
        })

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
            title: 'Proposed Safe transaction has been confirmed and executed',
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
      } catch (error) {
        console.debug({ error })
        errorToast({
          title: 'Error',
          message: 'Submitting the transaction batch failed',
        })
      }
    }

    executePlan()
  }, [actionData, avatar, chainId, connectorClient])

  const isSubmitting = useIsPending()

  if (
    disabled ||
    walletAccount.chainId !== chainId ||
    walletAccount.address?.toLowerCase() !== initiator?.toLowerCase() ||
    connectorClient == null
  ) {
    return <PrimaryButton disabled>Sign</PrimaryButton>
  }

  return (
    <PrimaryButton submit busy={isSubmitting}>
      Sign
    </PrimaryButton>
  )
}
