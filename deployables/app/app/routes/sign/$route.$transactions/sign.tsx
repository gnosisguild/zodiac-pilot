import { ConnectWallet } from '@/components'
import { simulateTransactionBundle } from '@/simulation-server'
import { parseRouteData, routeTitle } from '@/utils'
import { invariantResponse } from '@epic-web/invariant'
import { getChainId } from '@zodiac/chains'
import { getBoolean, getNumberMap } from '@zodiac/form-data'
import { checkPermissions, isValidRoute, queryRoutes } from '@zodiac/modules'
import { parseTransactionData } from '@zodiac/schema'
import { Error, Form, Success, Warning } from '@zodiac/ui'
import { ArrowDownToLine, ArrowLeftRight, ArrowUpFromLine } from 'lucide-react'
import { Suspense } from 'react'
import { Await } from 'react-router'
import { planExecution, unprefixAddress } from 'ser-kit'
import { getDefaultNonces } from '../getDefaultNonces'
import { revokeApprovalIfNeeded } from '../revokeApprovalIfNeeded'
import { ApprovalOverviewSection, ReviewAccountSection } from '../sections'
import { SignTransaction } from '../SignTransaction'
import { SignTransactionWithCallback } from '../SignTransactionWithCallback'
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
    route,
    initiator: unprefixAddress(route.initiator),
    safeAddress: unprefixAddress(route.avatar),
    chainId: getChainId(route.avatar),
    simulation: simulate(),
    permissionCheck: permissionCheckResult.permissionCheck,
    waypoints: route.waypoints,
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
    route,
    safeAddress,
    waypoints,
    isValidRoute,
    permissionCheck,
    simulation,
    hasQueryRoutesError,
    defaultSafeNonces,
  },
  actionData,
  params,
}: RouteType.ComponentProps) => {
  const transactions = parseTransactionData(params.transactions)
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
                    avatar={safeAddress}
                    icon={ArrowUpFromLine}
                    tokens={sent}
                  />

                  <TokenTransferTable
                    title="Tokens Received"
                    columnTitle="From"
                    avatar={safeAddress}
                    icon={ArrowDownToLine}
                    tokens={received}
                  />

                  <TokenTransferTable
                    title="Other Token Movements"
                    columnTitle="From → To"
                    avatar={safeAddress}
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
          routeId={route.id}
          routeLabel={route.label}
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
        {sessionStorage.getItem(`pilot_launch_${route.id}`) ? (
          <SignTransactionWithCallback
            chainId={chainId}
            walletAddress={initiator}
            safeAddress={safeAddress}
            executionPlan={actionData == null ? null : actionData.plan}
            routeId={route.id}
            transactions={transactions}
          />
        ) : (
          <SignTransaction
            chainId={chainId}
            walletAddress={initiator}
            safeAddress={safeAddress}
            executionPlan={actionData == null ? null : actionData.plan}
          />
        )}
      </Form.Actions>
    </Form>
  )
}

export default SubmitPage
