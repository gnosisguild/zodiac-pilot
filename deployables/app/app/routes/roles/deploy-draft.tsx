import { authorizedLoader } from '@/auth-server'
import { invariantResponse } from '@epic-web/invariant'
import {
  dbClient,
  getActivatedAccounts,
  getDefaultWallets,
  getRole,
  getRoleActions,
  getRoleMembers,
} from '@zodiac/db'
import { type Role as DbRole } from '@zodiac/db/schema'
import { decodeRoleKey, encodeRoleKey } from '@zodiac/modules'
import { isUUID, jsonStringify } from '@zodiac/schema'
import { Modal } from '@zodiac/ui'
import { UUID } from 'crypto'
import { LucideIcon, Plus, UserRoundPlus } from 'lucide-react'
import { PropsWithChildren, ReactNode, Suspense } from 'react'
import { Await, href, useNavigate } from 'react-router'
import {
  Account,
  AccountType,
  ChainId,
  planApplyAccounts,
  queryAccounts,
  withPredictedAddress,
  type AccountBuilderCall,
} from 'ser-kit'
import { Route } from './+types/deploy-draft'
import {
  LabeledAddress,
  Labels,
  ProvideAddressLabels,
} from './AddressLabelContext'

type Safe = Extract<Account, { type: AccountType.SAFE }>
type Role = Extract<Account, { type: AccountType.ROLES }>

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
      const { accounts: rolesMods, labels: roleLabels } = await getRolesMods(
        draft,
        allSafes,
      )

      const desired = [...newSafes, ...rolesMods]

      console.log(jsonStringify(desired, 2))

      return {
        plan: planApplyAccounts({
          // TODO: remove this
          current: [],
          desired,
        }),
        labels: {
          ...roleLabels,
          ...memberLabels,
        },
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
): Promise<{ accounts: Role[]; labels: Labels }> => {
  const activeAccounts = await getActivatedAccounts(dbClient(), {
    roleId: draft.id,
  })
  const actions = await getRoleActions(dbClient(), draft.id)

  return activeAccounts.reduce<{ accounts: Role[]; labels: Labels }>(
    (result, activeAccount) => {
      const account = withPredictedAddress<Role>(
        {
          type: AccountType.ROLES,
          allowances: [],
          avatar: activeAccount.address,
          chain: activeAccount.chainId,
          modules: [],
          multisend: [],
          owner: activeAccount.address,
          roles: actions.map((action) => ({
            key: encodeRoleKey(action.key),
            members: members.map((member) => member.address),
            annotations: [],
            targets: [],
          })),
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
      }
    },
    { accounts: [], labels: {} },
  )
}

const DeployDraft = ({
  loaderData: { plan, labels },
  params: { workspaceId },
}: Route.ComponentProps) => {
  const navigate = useNavigate()

  return (
    <Modal
      open
      title="Deploy draft"
      description="The following changes need to be applies to deploy this role. Please execute one transaction after the other."
      onClose={() =>
        navigate(
          href('/workspace/:workspaceId/roles/drafts', { workspaceId }),
          { replace: true },
        )
      }
    >
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

      <Modal.Actions>
        <Modal.CloseAction>Close</Modal.CloseAction>
      </Modal.Actions>
    </Modal>
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
    <FeedEntry
      icon={UserRoundPlus}
      title={
        <div className="flex gap-2">
          Add{' '}
          <LabeledAddress size="tiny" shorten>
            {props.member}
          </LabeledAddress>{' '}
          to{' '}
          <span className="font-semibold">{decodeRoleKey(props.roleKey)}</span>
        </div>
      }
    />
  )
}

const CreateNodeCall = (
  props: Extract<AccountBuilderCall, { call: 'createNode' }>,
) => {
  switch (props.accountType) {
    case AccountType.SAFE: {
      return (
        <FeedEntry
          icon={Plus}
          title={
            <div className="flex items-center gap-2">
              <span>
                Create <span className="font-semibold">Safe</span>
              </span>

              <LabeledAddress size="tiny" shorten>
                {props.deploymentAddress}
              </LabeledAddress>
            </div>
          }
        >
          <div className="flex flex-col gap-2">
            <span>Owners</span>

            <ul>
              {props.args.owners.map((owner) => (
                <li key={owner}>
                  <LabeledAddress size="tiny" shorten>
                    {owner}
                  </LabeledAddress>
                </li>
              ))}
            </ul>
          </div>
        </FeedEntry>
      )
    }
    case AccountType.ROLES: {
      return (
        <FeedEntry
          icon={Plus}
          title={
            <div className="flex items-center gap-2">
              <span>
                Create <span className="font-semibold">Role</span>
              </span>

              <LabeledAddress shorten size="tiny">
                {props.deploymentAddress}
              </LabeledAddress>
            </div>
          }
        >
          <div className="flex flex-col gap-2">
            <span>Target Safe</span>

            <LabeledAddress shorten size="tiny">
              {props.args.target}
            </LabeledAddress>
          </div>
        </FeedEntry>
      )
    }
  }

  return null
}

type FeedEntryProps = PropsWithChildren<{
  icon: LucideIcon
  title: ReactNode
}>

const FeedEntry = ({ title, icon: Icon, children }: FeedEntryProps) => (
  <div className="grid grid-cols-10 items-center gap-4 text-xs">
    <div className="flex items-start justify-center">
      <div className="rounded-full border border-zinc-700 bg-zinc-800 p-1">
        <Icon className="size-3" />
      </div>
    </div>

    <div className="col-span-9">{title}</div>

    {children && (
      <div className="col-span-9 col-start-2 flex flex-col gap-4">
        {children}
      </div>
    )}
  </div>
)
