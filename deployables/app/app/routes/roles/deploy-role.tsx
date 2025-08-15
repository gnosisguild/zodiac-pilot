import { authorizedAction, authorizedLoader } from '@/auth-server'
import { DebugJson, Page } from '@/components'
import { Chain } from '@/routes-ui'
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
  GhostButton,
  Info,
  InlineForm,
  Modal,
  NumberValue,
  SecondaryButton,
} from '@zodiac/ui'
import {
  ArrowRight,
  Code,
  Crosshair,
  HandCoins,
  LucideIcon,
  Plus,
  SquareFunction,
  UserRoundPlus,
} from 'lucide-react'
import { PropsWithChildren, Suspense, useState } from 'react'
import { Await, href, redirect } from 'react-router'
import {
  Account,
  AccountType,
  ChainId,
  planApplyAccounts,
  type AccountBuilderCall,
} from 'ser-kit'
import { Route } from './+types/deploy-role'
import {
  LabeledAddress,
  Labels,
  ProvideAddressLabels,
} from './AddressLabelContext'
import { LabeledRoleKey, ProvideRoleLabels } from './RoleLabelContext'
import { getMemberSafes } from './getMemberSafes'
import { parseRefillPeriod } from './getRefillPeriod'
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

const Description = ({ account }: { account: Account }) => {
  switch (account.type) {
    case AccountType.SAFE: {
      return (
        <div className="flex flex-col items-start gap-2 text-sm">
          <div className="font-semibold">
            Setup <span className="underline">Safe</span>{' '}
          </div>
          <LabeledAddress>{account.address}</LabeledAddress>
        </div>
      )
    }
    case AccountType.ROLES: {
      return (
        <div className="flex flex-col items-start gap-2 text-sm">
          <div className="font-semibold">
            Setup <span className="underline">Roles mod</span>{' '}
          </div>

          <div className="flex items-center gap-2">
            <LabeledAddress>{account.address}</LabeledAddress>
            <ArrowRight className="size-4" />
            <LabeledAddress>{account.target}</LabeledAddress>
          </div>
        </div>
      )
    }
  }
}

type CallProps = { chainId: ChainId; callData: AccountBuilderCall }
type DetailCallProps<CallType extends AccountBuilderCall['call']> = {
  chainId: ChainId
  callData: Extract<AccountBuilderCall, { call: CallType }>
}

const Call = ({ chainId, callData }: CallProps) => {
  switch (callData.call) {
    case 'createNode': {
      return <CreateNodeCall chainId={chainId} callData={callData} />
    }
    case 'assignRoles': {
      return <AssignRolesCall chainId={chainId} callData={callData} />
    }
    case 'setAllowance': {
      return <SetAllowanceCall chainId={chainId} callData={callData} />
    }
    case 'scopeTarget': {
      return <ScopeTargetCall chainId={chainId} callData={callData} />
    }
    case 'scopeFunction': {
      return <ScopeFunctionCall chainId={chainId} callData={callData} />
    }

    default: {
      return (
        <div className="text-xs">{`Missing node type for call "${callData.call}"`}</div>
      )
    }
  }
}

const ScopeFunctionCall = ({ callData }: DetailCallProps<'scopeFunction'>) => (
  <FeedEntry action="Scope function" icon={SquareFunction} raw={callData}>
    <LabeledItem label="Target">
      <LabeledAddress>{callData.targetAddress}</LabeledAddress>
    </LabeledItem>

    <LabeledItem label="Role">
      <LabeledRoleKey>{callData.roleKey}</LabeledRoleKey>
    </LabeledItem>
  </FeedEntry>
)

const ScopeTargetCall = ({ callData }: DetailCallProps<'scopeTarget'>) => (
  <FeedEntry icon={Crosshair} action="Scope target" raw={callData}>
    <LabeledItem label="Target">
      <LabeledAddress>{callData.targetAddress}</LabeledAddress>
    </LabeledItem>

    <LabeledItem label="Role">
      <LabeledRoleKey>{callData.roleKey}</LabeledRoleKey>
    </LabeledItem>
  </FeedEntry>
)

const SetAllowanceCall = ({ callData }: DetailCallProps<'setAllowance'>) => (
  <FeedEntry icon={HandCoins} action="Set allowance" raw={callData}>
    <LabeledItem label="Allowance">
      <NumberValue>{callData.refill}</NumberValue>
    </LabeledItem>

    <LabeledItem label="Period">
      {parseRefillPeriod(callData.period)}
    </LabeledItem>
  </FeedEntry>
)

const AssignRolesCall = ({ callData }: DetailCallProps<'assignRoles'>) => {
  return (
    <FeedEntry icon={UserRoundPlus} action="Add role member" raw={callData}>
      <LabeledItem label="Member">
        <LabeledAddress>{callData.member}</LabeledAddress>
      </LabeledItem>

      <LabeledItem label="Role">
        <LabeledRoleKey>{callData.roleKey}</LabeledRoleKey>
      </LabeledItem>
    </FeedEntry>
  )
}

const CreateNodeCall = ({
  callData,
  chainId,
}: DetailCallProps<'createNode'>) => {
  switch (callData.accountType) {
    case AccountType.SAFE: {
      return (
        <FeedEntry icon={Plus} action="Create Safe" raw={callData}>
          <LabeledItem label="Safe">
            <LabeledAddress>{callData.deploymentAddress}</LabeledAddress>
          </LabeledItem>

          <LabeledItem label="Owners">
            <ul>
              {callData.args.owners.map((owner) => (
                <li key={owner}>
                  <LabeledAddress>{owner}</LabeledAddress>
                </li>
              ))}
            </ul>
          </LabeledItem>
        </FeedEntry>
      )
    }
    case AccountType.ROLES: {
      return (
        <FeedEntry icon={Plus} action="Create role" raw={callData}>
          <LabeledItem label="Chain">
            <Chain chainId={chainId} />
          </LabeledItem>

          <LabeledItem label="Role">
            <LabeledAddress>{callData.deploymentAddress}</LabeledAddress>
          </LabeledItem>

          <LabeledItem label="Target Safe">
            <LabeledAddress>{callData.args.target}</LabeledAddress>
          </LabeledItem>
        </FeedEntry>
      )
    }
  }

  return null
}

type FeedEntryProps = PropsWithChildren<{
  icon: LucideIcon
  action: string
  raw: unknown
}>

const FeedEntry = ({ action, icon: Icon, children, raw }: FeedEntryProps) => {
  const [showRaw, setShowRaw] = useState(false)

  return (
    <>
      <div className="grid flex-1 grid-cols-10 items-center gap-4 text-sm">
        <div className="col-span-2 flex items-start justify-start gap-2">
          <div className="rounded-full border border-zinc-700 bg-zinc-800 p-1">
            <Icon className="size-3" />
          </div>

          {action}
        </div>

        {children && (
          <div className="col-span-7 col-start-3 grid grid-cols-3 gap-4">
            {children}
          </div>
        )}

        <div className="flex justify-end">
          <GhostButton
            iconOnly
            size="tiny"
            icon={Code}
            onClick={() => setShowRaw(true)}
          >
            Show raw
          </GhostButton>
        </div>
      </div>

      <Modal
        open={showRaw}
        onClose={() => setShowRaw(false)}
        size="4xl"
        title="Raw call data"
      >
        <DebugJson data={raw} />

        <Modal.Actions>
          <Modal.CloseAction>Close</Modal.CloseAction>
        </Modal.Actions>
      </Modal>
    </>
  )
}

const LabeledItem = ({
  label,
  children,
}: PropsWithChildren<{ label: string }>) => (
  <div className="flex flex-col gap-4">
    <div className="text-xs font-semibold opacity-75">{label}</div>
    <div>{children}</div>
  </div>
)
