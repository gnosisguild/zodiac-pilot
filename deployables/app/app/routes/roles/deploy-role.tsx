import { authorizedAction, authorizedLoader } from '@/auth-server'
import { Page } from '@/components'
import { invariantResponse } from '@epic-web/invariant'
import { getChainId } from '@zodiac/chains'
import {
  dbClient,
  getAccountByAddress,
  getActivatedAccounts,
  getRole,
  getRoleActionAssets,
  proposeTransaction,
} from '@zodiac/db'
import { getPrefixedAddress } from '@zodiac/form-data'
import { createMockTransactionRequest } from '@zodiac/modules/test-utils'
import { isUUID } from '@zodiac/schema'
import {
  Card,
  Collapsible,
  Info,
  InlineForm,
  SecondaryButton,
} from '@zodiac/ui'
import { Suspense } from 'react'
import { Await, href, redirect } from 'react-router'
import { planApplyAccounts } from 'ser-kit'
import { Route } from './+types/deploy-role'
import { Labels, ProvideAddressLabels } from './AddressLabelContext'
import { Call } from './Call'
import { Description } from './FeedEntry'
import { ProvideRoleLabels } from './RoleLabelContext'
import { getMemberSafes } from './getMemberSafes'
import { getRoleMods } from './getRoleMods'
import { Intent } from './intents'
import { Issues } from './issues'

const contractLabels: Labels = {
  ['0x23da9ade38e4477b23770ded512fd37b12381fab']: 'Cowswap',
}

export const loader = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async ({ params: { roleId } }) => {
      invariantResponse(isUUID(roleId), '"roleId" is not a UUID')

      const role = await getRole(dbClient(), roleId)

      const activatedAccounts = await getActivatedAccounts(dbClient(), {
        roleId,
      })

      const activeChains = Array.from(
        new Set(activatedAccounts.map((account) => account.chainId)),
      )

      const assets = await getRoleActionAssets(dbClient(), { roleId })

      const assetLabels = assets.reduce<Labels>(
        (result, asset) => ({ ...result, [asset.address]: asset.symbol }),
        {},
      )

      const {
        newSafes,
        allSafes,
        labels: memberLabels,
        issues: memberIssues,
      } = await getMemberSafes(roleId, activeChains)
      const {
        accounts: rolesMods,
        labels: rolesLabels,
        roleLabels,
        issues: roleIssues,
      } = await getRoleMods(role, allSafes)

      const desired = [...newSafes, ...rolesMods]

      return {
        plan: planApplyAccounts({
          desired,
        }),
        labels: {
          ...rolesLabels,
          ...memberLabels,
          ...assetLabels,
          ...contractLabels,
        },
        roleLabels,
        issues: [...roleIssues, ...memberIssues],
      }
    },
    {
      ensureSignedIn: true,
      async hasAccess({ params: { roleId, workspaceId }, tenant }) {
        invariantResponse(isUUID(roleId), '"roleId" is no UUID')

        const role = await getRole(dbClient(), roleId)

        return role.tenantId === tenant.id && role.workspaceId === workspaceId
      },
    },
  )

export const action = (args: Route.ActionArgs) =>
  authorizedAction(
    args,
    async ({
      request,
      params: { roleId, workspaceId },
      context: {
        auth: { user, tenant },
      },
    }) => {
      invariantResponse(isUUID(roleId), '"roleId" is no UUID')

      const data = await request.formData()

      const role = await getRole(dbClient(), roleId)
      const account = await getAccountByAddress(dbClient(), {
        tenantId: tenant.id,
        prefixedAddress: getPrefixedAddress(data, 'account'),
      })

      const transactionProposal = await proposeTransaction(dbClient(), {
        userId: user.id,
        tenantId: tenant.id,
        workspaceId: role.workspaceId,
        accountId: account.id,
        transaction: [createMockTransactionRequest()],
      })

      return redirect(
        href('/workspace/:workspaceId/submit/proposal/:proposalId', {
          workspaceId,
          proposalId: transactionProposal.id,
        }),
      )
    },
    {
      ensureSignedIn: true,
      async hasAccess({ params: { roleId, workspaceId }, tenant }) {
        invariantResponse(isUUID(roleId), '"roleId" is no UUID')

        const role = await getRole(dbClient(), roleId)

        return role.tenantId === tenant.id && role.workspaceId === workspaceId
      },
    },
  )

const DeployRole = ({
  loaderData: { plan, labels, roleLabels, issues },
}: Route.ComponentProps) => {
  return (
    <Page>
      <Page.Header>Deploy role</Page.Header>

      <Page.Main>
        <Issues issues={issues} />

        <ProvideRoleLabels labels={roleLabels}>
          <ProvideAddressLabels labels={labels}>
            <Suspense>
              <Await resolve={plan}>
                {(plan) => {
                  if (plan.length === 0) {
                    return (
                      <Info title="Nothing to deploy">
                        No changes to be applied.
                      </Info>
                    )
                  }

                  return (
                    <div className="flex flex-col gap-8">
                      <Info>
                        The following changes need to be applied to deploy this
                        role. Please execute one transaction after the other.
                      </Info>

                      {plan.map(({ account, steps }, planIndex) => (
                        <Card key={`${account.prefixedAddress}-${planIndex}`}>
                          <Collapsible
                            header={
                              <div className="flex flex-1 items-center justify-between gap-8">
                                <Description account={account} />

                                <InlineForm
                                  context={{ account: account.prefixedAddress }}
                                >
                                  <SecondaryButton
                                    submit
                                    size="small"
                                    intent={Intent.ExecuteTransaction}
                                    onClick={(event) => event.stopPropagation()}
                                  >
                                    Deploy
                                  </SecondaryButton>
                                </InlineForm>
                              </div>
                            }
                          >
                            <div className="flex flex-col gap-4 divide-y divide-zinc-700 pt-4">
                              {steps.map(({ call }, index) => (
                                <div
                                  key={`${account.prefixedAddress}=${planIndex}-${index}`}
                                  className="not-last:pb-4"
                                >
                                  <Call
                                    callData={call}
                                    chainId={getChainId(
                                      account.prefixedAddress,
                                    )}
                                  />
                                </div>
                              ))}
                            </div>
                          </Collapsible>
                        </Card>
                      ))}
                    </div>
                  )
                }}
              </Await>
            </Suspense>
          </ProvideAddressLabels>
        </ProvideRoleLabels>
      </Page.Main>
    </Page>
  )
}

export default DeployRole
