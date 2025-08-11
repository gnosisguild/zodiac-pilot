import { authorizedLoader } from '@/auth-server'
import { Page } from '@/components'
import { invariantResponse } from '@epic-web/invariant'
import {
  dbClient,
  getActivatedAccounts,
  getDefaultWallets,
  getRole,
  getRoleActionAssets,
  getRoleActions,
  getRoleMembers,
} from '@zodiac/db'
import { type Role as DbRole } from '@zodiac/db/schema'
import { encodeRoleKey } from '@zodiac/modules'
import { isUUID } from '@zodiac/schema'
import { Info } from '@zodiac/ui'
import { UUID } from 'crypto'
import { LucideIcon, Plus, UserRoundPlus } from 'lucide-react'
import { PropsWithChildren, Suspense } from 'react'
import { Await } from 'react-router'
import {
  Account,
  AccountType,
  ChainId,
  planApplyAccounts,
  queryAccounts,
  withPredictedAddress,
  type AccountBuilderCall,
} from 'ser-kit'
import { Role } from 'zodiac-roles-sdk'
import { Route } from './+types/deploy-draft'
import {
  LabeledAddress,
  Labels,
  ProvideAddressLabels,
} from './AddressLabelContext'
import {
  LabeledRoleKey,
  ProvideRoleLabels,
  RoleLabels,
} from './RoleLabelContext'

type Safe = Extract<Account, { type: AccountType.SAFE }>
type Roles = Extract<Account, { type: AccountType.ROLES }>

export const loader = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async ({ params: { draftId } }) => {
      invariantResponse(isUUID(draftId), '"draftId" is not a UUID')

      const draft = await getRole(dbClient(), draftId)

      const activatedAccounts = await getActivatedAccounts(dbClient(), {
        roleId: draft.id,
      })

      const activeChains = Array.from(
        new Set(activatedAccounts.map((account) => account.chainId)),
      )

      const {
        newSafes,
        allSafes,
        labels: memberLabels,
      } = await getMemberSafes(draft.id, activeChains)
      const {
        accounts: rolesMods,
        labels: rolesLabels,
        roleLabels,
      } = await getRolesMods(draft, allSafes)

      const desired = [...newSafes, ...rolesMods]

      return {
        plan: planApplyAccounts({
          // TODO: remove this
          current: [],
          desired,
        }),
        labels: {
          ...rolesLabels,
          ...memberLabels,
        },
        roleLabels,
      }
    },
    {
      ensureSignedIn: true,
      async hasAccess({ params: { draftId, workspaceId }, tenant }) {
        invariantResponse(isUUID(draftId), '"draftId" is no UUID')

        const draft = await getRole(dbClient(), draftId)

        return draft.tenantId === tenant.id && draft.workspaceId === workspaceId
      },
    },
  )

const getMemberSafes = async (
  roleId: UUID,
  activeChains: ChainId[],
): Promise<{ newSafes: Account[]; allSafes: Account[]; labels: Labels }> => {
  const members = await getRoleMembers(dbClient(), { roleId })

  const newSafes: Account[] = []
  const allSafes: Account[] = []

  const labels: Labels = {}

  for (const member of members) {
    const defaultWallets = await getDefaultWallets(dbClient(), member.id)

    for (const chainId of activeChains) {
      if (defaultWallets[chainId] == null) {
        continue
      }

      const safe = withPredictedAddress<Safe>(
        {
          type: AccountType.SAFE,
          chain: chainId,
          modules: [],
          owners: [defaultWallets[chainId].address],
          threshold: 1,
        },
        member.nonce,
      )

      const [existingSafe] = await queryAccounts([safe.prefixedAddress])

      labels[safe.address] = member.fullName
      labels[defaultWallets[chainId].address] = defaultWallets[chainId].label

      if (existingSafe == null) {
        newSafes.push(safe)
      }

      allSafes.push(safe)
    }
  }

  return { newSafes, allSafes, labels }
}

const getRolesMods = async (
  draft: DbRole,
  members: Account[],
): Promise<{ accounts: Roles[]; labels: Labels; roleLabels: RoleLabels }> => {
  const activeAccounts = await getActivatedAccounts(dbClient(), {
    roleId: draft.id,
  })
  const actions = await getRoleActions(dbClient(), draft.id)
  const assetsByAction = await getRoleActionAssets(dbClient(), {
    roleId: draft.id,
  })

  return activeAccounts.reduce<{
    accounts: Roles[]
    labels: Labels
    roleLabels: RoleLabels
  }>(
    (result, activeAccount) => {
      const { roles, labels } = actions.reduce<{
        roles: Omit<Role, 'lastUpdate'>[]
        labels: RoleLabels
      }>(
        (result, action) => {
          const key = encodeRoleKey(action.key)

          const role = {
            key,
            members: members.map((member) => member.address),
            annotations: [],
            targets: [],
          }

          return {
            roles: [...result.roles, role],
            labels: { ...result.labels, [key]: action.label },
          }
        },
        { roles: [], labels: {} },
      )

      const account = withPredictedAddress<Roles>(
        {
          type: AccountType.ROLES,
          allowances: [],
          avatar: activeAccount.address,
          chain: activeAccount.chainId,
          modules: [],
          multisend: [],
          owner: activeAccount.address,
          roles,
          target: activeAccount.address,
          version: 2,
        },
        draft.nonce,
      )

      return {
        accounts: [...result.accounts, account],
        labels: {
          ...result.labels,
          [account.address]: draft.label,
          [activeAccount.address]: activeAccount.label,
        },
        roleLabels: { ...result.roleLabels, ...labels },
      }
    },
    { accounts: [], labels: {}, roleLabels: {} },
  )
}

const DeployDraft = ({
  loaderData: { plan, labels, roleLabels },
}: Route.ComponentProps) => {
  return (
    <Page>
      <Page.Header>Deploy draft</Page.Header>

      <Page.Main>
        <div className="mb-8">
          <Info>
            The following changes need to be applies to deploy this role. Please
            execute one transaction after the other.
          </Info>
        </div>

        <ProvideRoleLabels labels={roleLabels}>
          <ProvideAddressLabels labels={labels}>
            <Suspense>
              <Await resolve={plan}>
                {(plan) => {
                  console.log({ plan })

                  return (
                    <div className="flex flex-col gap-4 divide-y divide-zinc-700">
                      {plan.map(({ account, steps }, planIndex) =>
                        steps.map((step, index) => (
                          <div
                            key={`${account.prefixedAddress}=${planIndex}-${index}`}
                            className="pb-4"
                          >
                            <Call key={index} {...step.call} />
                          </div>
                        )),
                      )}
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

export default DeployDraft

type CallProps = AccountBuilderCall

const Call = (props: CallProps) => {
  switch (props.call) {
    case 'createNode': {
      return <CreateNodeCall {...props} />
    }
    case 'assignRoles': {
      return <AssignRolesCall {...props} />
    }

    default: {
      return (
        <div className="text-xs">{`Missing node type for call "${props.call}"`}</div>
      )
    }
  }
}

const AssignRolesCall = (
  props: Extract<AccountBuilderCall, { call: 'assignRoles' }>,
) => {
  return (
    <FeedEntry icon={UserRoundPlus} action="Add role member">
      <LabeledItem label="Member">
        <LabeledAddress size="small" shorten>
          {props.member}
        </LabeledAddress>
      </LabeledItem>

      <LabeledItem label="Role">
        <LabeledRoleKey>{props.roleKey}</LabeledRoleKey>
      </LabeledItem>
    </FeedEntry>
  )
}

const CreateNodeCall = (
  props: Extract<AccountBuilderCall, { call: 'createNode' }>,
) => {
  switch (props.accountType) {
    case AccountType.SAFE: {
      return (
        <FeedEntry icon={Plus} action="Create Safe">
          <LabeledItem label="Safe">
            <LabeledAddress size="small" shorten>
              {props.deploymentAddress}
            </LabeledAddress>
          </LabeledItem>

          <LabeledItem label="Owners">
            <ul>
              {props.args.owners.map((owner) => (
                <li key={owner}>
                  <LabeledAddress size="small" shorten>
                    {owner}
                  </LabeledAddress>
                </li>
              ))}
            </ul>
          </LabeledItem>
        </FeedEntry>
      )
    }
    case AccountType.ROLES: {
      return (
        <FeedEntry icon={Plus} action="Create role">
          <LabeledItem label="Role">
            <LabeledAddress shorten size="small">
              {props.deploymentAddress}
            </LabeledAddress>
          </LabeledItem>

          <LabeledItem label="Target Safe">
            <LabeledAddress shorten size="small">
              {props.args.target}
            </LabeledAddress>
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
}>

const FeedEntry = ({ action, icon: Icon, children }: FeedEntryProps) => (
  <div className="grid grid-cols-10 items-center gap-4 text-sm">
    <div className="col-span-2 flex items-start justify-start gap-2">
      <div className="rounded-full border border-zinc-700 bg-zinc-800 p-1">
        <Icon className="size-3" />
      </div>

      {action}
    </div>

    {children && (
      <div className="col-span-8 col-start-3 grid grid-cols-4 gap-4">
        {children}
      </div>
    )}
  </div>
)

const LabeledItem = ({
  label,
  children,
}: PropsWithChildren<{ label: string }>) => (
  <div className="flex flex-col gap-4">
    <div className="text-xs font-semibold opacity-75">{label}</div>
    <div>{children}</div>
  </div>
)
