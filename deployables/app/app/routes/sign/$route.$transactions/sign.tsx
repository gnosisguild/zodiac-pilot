import { ConnectWallet } from '@/components'
import { simulateTransactionBundle } from '@/simulation-server'
import {
  jsonRpcProvider,
  parseRouteData,
  parseTransactionData,
  routeTitle,
} from '@/utils'
import { invariantResponse } from '@epic-web/invariant'
import { EXPLORER_URL, getChainId } from '@zodiac/chains'
import { getBoolean, getNumberMap } from '@zodiac/form-data'
import { useIsPending } from '@zodiac/hooks'
import {
  CompanionAppMessageType,
  type CompanionAppMessage,
} from '@zodiac/messages'
import { checkPermissions, isValidRoute, queryRoutes } from '@zodiac/modules'
import { waitForMultisigExecution } from '@zodiac/safe'
import {
  Error,
  errorToast,
  Form,
  PrimaryButton,
  Success,
  successToast,
  Warning,
} from '@zodiac/ui'
import type { Eip1193Provider } from 'ethers'
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
import { getDefaultNonces } from '../getDefaultNonces'
import { revokeApprovalIfNeeded } from '../revokeApprovalIfNeeded'
import { ApprovalOverviewSection, ReviewAccountSection } from '../sections'
import { SkeletonFlowTable, TokenTransferTable } from '../table'
import type { Route as RouteType } from './+types/sign'

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

  const [plan, queryRoutesResult, permissionCheckResult] = await Promise.all([
    planExecution(metaTransactions, {
      initiator: route.initiator,
      waypoints: route.waypoints,
      ...route,
    }),
    queryRoutes(route.initiator, route.avatar),
    checkPermissions(route, metaTransactions),
  ])

  const simulate = async () => {
    const { error, tokenFlows, approvals } = await simulateTransactionBundle(
      route.avatar,
      metaTransactions,
    )

    return {
      error,
      tokenFlows,
      approvals,
    }
  }

  return {
    isValidRoute: isValidRoute(queryRoutesResult),
    hasQueryRoutesError: queryRoutesResult.error != null,
    id: route.id,
    initiator: unprefixAddress(route.initiator),
    avatar: route.avatar,
    chainId: getChainId(route.avatar),
    simulation: simulate(),
    permissionCheck: permissionCheckResult.permissionCheck,
    waypoints: route.waypoints,
    metaTransactions,
    defaultSafeNonces: getDefaultNonces(plan),
  }
}

export const action = async ({ params, request }: RouteType.ActionArgs) => {
  const { initiator, waypoints, ...route } = parseRouteData(params.route)

  invariantResponse(initiator != null, 'Route needs an initiator')
  invariantResponse(waypoints != null, 'Route does not provide any waypoints')

  const data = await request.formData()

  const metaTransactions = await revokeApprovalIfNeeded(
    route.avatar,
    parseTransactionData(params.transactions),
    { revokeApprovals: getBoolean(data, 'revokeApprovals') },
  )

  return {
    plan: await planExecution(
      metaTransactions,
      {
        initiator,
        waypoints,
        ...route,
      },
      {
        safeTransactionProperties: getNumberMap(data, 'customSafeNonce', {
          mapValue: (nonce) => ({ nonce }),
        }),
      },
    ),
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
    defaultSafeNonces,
  },
}: RouteType.ComponentProps) => {
  return (
    <Form>
      <Form.Section
        title="Review token flows"
        description="See all token transfers associated with this transaction bundle at a glance."
      >
        <Suspense fallback={<SkeletonFlowTable />}>
          <Await resolve={simulation}>
            {({ error, tokenFlows: { sent, received, other } }) =>
              error ? (
                <Warning title="Token flow simulation is unavailable at the moment" />
              ) : (
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
              )
            }
          </Await>
        </Suspense>
      </Form.Section>

      <Form.Section
        title="Review approvals"
        description="Token approvals let other addresses spend your tokens. If you don't
            revoke approvals, they can keep spending indefinitely."
      >
        <ApprovalOverviewSection simulation={simulation} />
      </Form.Section>

      <Form.Section
        title="Permission check"
        description="The transaction bundle is checked against permissions on the execution route."
      >
        {permissionCheck == null ? (
          <Warning title="Permissions check unavailable">
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
        description="Verify the account and execution route for signing this transaction bundle."
      >
        <ReviewAccountSection
          id={id}
          isValidRoute={isValidRoute}
          hasQueryRoutesError={hasQueryRoutesError}
          chainId={chainId}
          waypoints={waypoints}
          defaultSafeNonces={defaultSafeNonces}
        />
      </Form.Section>

      <Form.Section
        title="Pilot Signer"
        description="Make sure that your wallet is connected to the route's operator account."
      >
        <ConnectWallet chainId={chainId} pilotAddress={initiator} />
      </Form.Section>

      <Form.Actions>
        <SubmitTransaction />
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
            plan.findIndex(
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
