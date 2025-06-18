import { authorizedAction, authorizedLoader } from '@/auth-server'
import { ConnectWallet } from '@/components'
import { simulateTransactionBundle } from '@/simulation-server'
import { routeTitle } from '@/utils'
import { invariantResponse } from '@epic-web/invariant'
import {
  confirmTransactionProposal,
  dbClient,
  getActiveRoute,
  getProposedTransaction,
  getSignedTransaction,
  saveTransaction,
  toExecutionRoute,
} from '@zodiac/db'
import {
  formData,
  getBoolean,
  getNumberMap,
  getOptionalString,
  getString,
} from '@zodiac/form-data'
import { checkPermissions, isValidRoute, queryRoutes } from '@zodiac/modules'
import { isUUID } from '@zodiac/schema'
import { DateValue, Error, Form, Info, Success, Warning } from '@zodiac/ui'
import { ArrowDownToLine, ArrowLeftRight, ArrowUpFromLine } from 'lucide-react'
import { Suspense } from 'react'
import { Await, useSubmit } from 'react-router'
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
      params: { proposalId },
      context: {
        auth: { tenant, user },
      },
    }) => {
      invariantResponse(isUUID(proposalId), 'Proposal ID is not a UUID')

      const proposal = await getProposedTransaction(dbClient(), proposalId)

      const { route, account } = await getActiveRoute(
        dbClient(),
        tenant,
        user,
        proposal.accountId,
      )

      const executionRoute = toExecutionRoute({
        wallet: route.wallet,
        account,
        route,
      })

      const [plan, queryRoutesResult, permissionCheckResult] =
        await Promise.all([
          planExecution(proposal.transaction, executionRoute),
          queryRoutes(executionRoute.initiator, executionRoute.avatar),
          checkPermissions(executionRoute, proposal.transaction),
        ])

      const simulate = async () => {
        const { error, tokenFlows, approvals } =
          await simulateTransactionBundle(
            executionRoute.avatar,
            proposal.transaction,
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
        alreadySigned: proposal.signedTransactionId != null,
        signedTransaction:
          proposal.signedTransactionId == null
            ? null
            : await getSignedTransaction(
                dbClient(),
                proposal.signedTransactionId,
              ),
        defaultSafeNonces: getDefaultNonces(plan),
      }
    },
    {
      ensureSignedIn: true,
      async hasAccess({ tenant, params: { proposalId } }) {
        invariantResponse(isUUID(proposalId), `"${proposalId}" is not a UUID`)

        const proposal = await getProposedTransaction(dbClient(), proposalId)

        return proposal.tenantId === tenant.id
      },
    },
  )

export const action = async (args: Route.ActionArgs) =>
  authorizedAction(
    args,
    async ({
      request,
      params: { proposalId },
      context: {
        auth: { tenant, user },
      },
    }) => {
      invariantResponse(isUUID(proposalId), `"${proposalId}" is not a UUID`)

      const proposal = await getProposedTransaction(dbClient(), proposalId)

      const { route, account } = await getActiveRoute(
        dbClient(),
        tenant,
        user,
        proposal.accountId,
      )

      const data = await request.formData()

      const metaTransactions = await revokeApprovalIfNeeded(
        prefixAddress(account.chainId, account.address),
        proposal.transaction,
        {
          revokeApprovals: getBoolean(data, 'revokeApprovals'),
        },
      )

      switch (getString(data, 'intent')) {
        case Intent.PlanExecution: {
          const plan = await planExecution(
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
          )

          return { plan }
        }

        case Intent.SignTransaction: {
          const transaction = await saveTransaction(dbClient(), tenant, user, {
            accountId: proposal.accountId,
            walletId: route.wallet.id,
            routeId: route.id,

            transaction: metaTransactions,

            safeWalletUrl: getOptionalString(data, 'safeWalletUrl'),
            explorerUrl: getOptionalString(data, 'explorerUrl'),
          })

          await confirmTransactionProposal(dbClient(), {
            proposalId: proposal.id,
            signedTransactionId: transaction.id,
          })

          return null
        }
      }
    },
    {
      ensureSignedIn: true,
      async hasAccess({ user, tenant, params: { proposalId } }) {
        invariantResponse(isUUID(proposalId), `"${proposalId}" is not a UUID`)

        const proposal = await getProposedTransaction(dbClient(), proposalId)

        const { route } = await getActiveRoute(
          dbClient(),
          tenant,
          user,
          proposal.accountId,
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
    signedTransaction,
  },
  actionData,
}: Route.ComponentProps) => {
  const submit = useSubmit()

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

      {signedTransaction && (
        <Info title="Transaction bundle already signed">
          This transaction bundle has already been signed by{' '}
          {signedTransaction.signer.fullName} on{' '}
          <DateValue>{signedTransaction.createdAt}</DateValue>
        </Info>
      )}

      <Form.Actions>
        <SignTransaction
          disabled={signedTransaction != null}
          intent={Intent.PlanExecution}
          chainId={account.chainId}
          walletAddress={wallet.address}
          safeAddress={account.address}
          executionPlan={actionData == null ? null : actionData.plan}
          onSign={(options) => {
            submit(formData({ intent: Intent.SignTransaction, ...options }), {
              method: 'POST',
            })
          }}
        />
      </Form.Actions>
    </Form>
  )
}

export default SubmitPage

enum Intent {
  PlanExecution = 'PlanExecution',
  SignTransaction = 'SignTransaction',
}
