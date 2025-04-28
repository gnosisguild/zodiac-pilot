import { authorizedAction, authorizedLoader } from '@/auth'
import { ConnectWallet } from '@/components'
import { simulateTransactionBundle } from '@/simulation-server'
import { parseTransactionData, routeTitle } from '@/utils'
import { invariantResponse } from '@epic-web/invariant'
import {
  dbClient,
  getAccount,
  getActiveRoute,
  toExecutionRoute,
} from '@zodiac/db'
import { getBoolean, getNumberMap } from '@zodiac/form-data'
import { checkPermissions, isValidRoute, queryRoutes } from '@zodiac/modules'
import { isUUID } from '@zodiac/schema'
import { Error, Form, Success, Warning } from '@zodiac/ui'
import { ArrowDownToLine, ArrowLeftRight, ArrowUpFromLine } from 'lucide-react'
import { Suspense } from 'react'
import { Await } from 'react-router'
import { planExecution, prefixAddress } from 'ser-kit'
import { getDefaultNonces } from '../getDefaultNonces'
import { revokeApprovalIfNeeded } from '../revokeApprovalIfNeeded'
import { ApprovalOverviewSection, ReviewAccountSection } from '../sections'
import { SignTransaction } from '../SignTransaction'
import { SkeletonFlowTable, TokenTransferTable } from '../table'
import type { Route } from './+types/sign'

export const meta: Route.MetaFunction = ({ matches }) => [
  { title: routeTitle(matches, 'Sign transaction bundle') },
]

export const loader = async (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async ({
      params: { transactions, accountId },
      context: {
        auth: { tenant, user },
      },
    }) => {
      invariantResponse(isUUID(accountId), `"${accountId}" is not a UUID`)

      const metaTransactions = parseTransactionData(transactions)
      const { route, account } = await getActiveRoute(
        dbClient(),
        tenant,
        user,
        accountId,
      )

      const executionRoute = toExecutionRoute({
        wallet: route.wallet,
        account,
        route,
      })

      const [plan, queryRoutesResult, permissionCheckResult] =
        await Promise.all([
          planExecution(metaTransactions, executionRoute),
          queryRoutes(executionRoute.initiator, executionRoute.avatar),
          checkPermissions(executionRoute, metaTransactions),
        ])

      const simulate = async () => {
        const { error, tokenFlows, approvals } =
          await simulateTransactionBundle(
            executionRoute.avatar,
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
        account,
        wallet: route.wallet,
        simulation: simulate(),
        permissionCheck: permissionCheckResult.permissionCheck,
        waypoints: route.waypoints,
        defaultSafeNonces: getDefaultNonces(plan),
      }
    },
    {
      ensureSignedIn: true,
      async hasAccess({ tenant, params: { accountId } }) {
        invariantResponse(isUUID(accountId), `"${accountId}" is not a UUID`)

        const account = await getAccount(dbClient(), accountId)

        return account.tenantId === tenant.id
      },
    },
  )

export const action = async (args: Route.ActionArgs) =>
  authorizedAction(
    args,
    async ({
      request,
      params: { transactions, accountId },
      context: {
        auth: { tenant, user },
      },
    }) => {
      invariantResponse(isUUID(accountId), `"${accountId}" is not a UUID`)

      const { route, account } = await getActiveRoute(
        dbClient(),
        tenant,
        user,
        accountId,
      )

      const data = await request.formData()

      const metaTransactions = await revokeApprovalIfNeeded(
        prefixAddress(account.chainId, account.address),
        parseTransactionData(transactions),
        {
          revokeApprovals: getBoolean(data, 'revokeApprovals'),
        },
      )

      return {
        plan: await planExecution(
          metaTransactions,
          toExecutionRoute({
            wallet: route.wallet,
            account,
            route,
          }),
          {
            safeTransactionProperties: getNumberMap(data, 'customSafeNonce', {
              mapValue: (nonce) => ({ nonce }),
            }),
          },
        ),
      }
    },
    {
      ensureSignedIn: true,
      async hasAccess({ user, tenant, params: { accountId } }) {
        invariantResponse(isUUID(accountId), `"${accountId}" is not a UUID`)

        const { route } = await getActiveRoute(
          dbClient(),
          tenant,
          user,
          accountId,
        )

        return route.wallet.belongsToId === user.id
      },
    },
  )

const SubmitPage = ({
  loaderData: {
    wallet,
    id,
    account,
    waypoints,
    isValidRoute,
    permissionCheck,
    simulation,
    hasQueryRoutesError,
    defaultSafeNonces,
  },
  actionData,
}: Route.ComponentProps) => {
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
                    avatar={account.address}
                    icon={ArrowUpFromLine}
                    tokens={sent}
                  />

                  <TokenTransferTable
                    title="Tokens Received"
                    columnTitle="From"
                    avatar={account.address}
                    icon={ArrowDownToLine}
                    tokens={received}
                  />

                  <TokenTransferTable
                    title="Other Token Movements"
                    columnTitle="From → To"
                    avatar={account.address}
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
          chainId={account.chainId}
          waypoints={waypoints}
          defaultSafeNonces={defaultSafeNonces}
        />
      </Form.Section>

      <Form.Section
        title="Pilot Signer"
        description="Make sure that your wallet is connected to the route's operator account."
      >
        <ConnectWallet
          chainId={account.chainId}
          pilotAddress={wallet.address}
        />
      </Form.Section>

      <Form.Actions>
        <SignTransaction
          chainId={account.chainId}
          walletAddress={wallet.address}
          safeAddress={prefixAddress(account.chainId, account.address)}
          executionPlan={actionData == null ? null : actionData.plan}
        />
      </Form.Actions>
    </Form>
  )
}

export default SubmitPage
