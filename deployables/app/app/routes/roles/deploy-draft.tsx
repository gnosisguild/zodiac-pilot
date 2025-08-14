import { authorizedLoader } from '@/auth-server'
import { DebugJson, Page } from '@/components'
import { Chain } from '@/routes-ui'
import { invariantResponse } from '@epic-web/invariant'
import { getChainId } from '@zodiac/chains'
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
import { Card, GhostButton, Info, Modal, NumberValue } from '@zodiac/ui'
import { UUID } from 'crypto'
import {
  Code,
  Crosshair,
  HandCoins,
  LucideIcon,
  Plus,
  SquareFunction,
  UserRoundPlus,
} from 'lucide-react'
import { PropsWithChildren, Suspense, useState } from 'react'
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
import {
  Allowance,
  Annotation,
  processPermissions,
  Target,
} from 'zodiac-roles-sdk'
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
import { computeSwapPermissions } from './computeSwapPermissions'
import { getRefillPeriod, parseRefillPeriod } from './getRefillPeriod'

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

      const assets = await getRoleActionAssets(dbClient(), { roleId: draft.id })

      const assetLabels = assets.reduce<Labels>(
        (result, asset) => ({ ...result, [asset.address]: asset.symbol }),
        {},
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
          desired,
        }),
        labels: {
          ...rolesLabels,
          ...memberLabels,
          ...assetLabels,
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
  const assets = await getRoleActionAssets(dbClient(), {
    roleId: draft.id,
  })

  return activeAccounts.reduce<{
    accounts: Roles[]
    labels: Labels
    roleLabels: RoleLabels
  }>(
    (result, activeAccount) => {
      const { annotations, targets } = actions.reduce<{
        annotations: Annotation[]
        targets: Target[]
      }>(
        (result, action) => {
          const actionAssets = assets.filter(
            (asset) => asset.roleActionId === action.id,
          )

          if (actionAssets.length === 0) {
            return result
          }

          const permissions = computeSwapPermissions(actionAssets)

          const { annotations, targets } = processPermissions(permissions)

          return {
            annotations: [...result.annotations, ...annotations],
            targets: [...result.targets, ...targets],
          }
        },
        { annotations: [], targets: [] },
      )

      const account = withPredictedAddress<Roles>(
        {
          type: AccountType.ROLES,
          allowances: assets.reduce<Allowance[]>((result, asset) => {
            if (asset.allowance == null || asset.interval == null) {
              return result
            }

            return [
              ...result,
              {
                balance: asset.allowance,
                key: encodeRoleKey(asset.allowanceKey),
                maxRefill: asset.allowance,
                period: getRefillPeriod(asset.interval),
                refill: asset.allowance,
                timestamp: BigInt(new Date().getTime()),
              },
            ]
          }, []),
          avatar: activeAccount.address,
          chain: activeAccount.chainId,
          modules: [],
          multisend: [],
          owner: activeAccount.address,
          roles: [
            {
              key: encodeRoleKey(draft.key),
              members: members.map((member) => member.address),
              annotations,
              targets,
            },
          ],
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
        roleLabels: { ...result.roleLabels, [draft.key]: draft.label },
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
            The following changes need to be applied to deploy this role. Please
            execute one transaction after the other.
          </Info>
        </div>

        <ProvideRoleLabels labels={roleLabels}>
          <ProvideAddressLabels labels={labels}>
            <Suspense>
              <Await resolve={plan}>
                {(plan) =>
                  plan.map(({ account, steps }, planIndex) => (
                    <Card key={`${account.prefixedAddress}-${planIndex}`}>
                      <div className="flex flex-col gap-4 divide-y divide-zinc-700">
                        {steps.map((step, index) => (
                          <div
                            key={`${account.prefixedAddress}=${planIndex}-${index}`}
                            className="not-last:pb-4"
                          >
                            <Call
                              key={index}
                              {...step.call}
                              chainId={getChainId(account.prefixedAddress)}
                            />
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))
                }
              </Await>
            </Suspense>
          </ProvideAddressLabels>
        </ProvideRoleLabels>
      </Page.Main>
    </Page>
  )
}

export default DeployDraft

type CallProps = AccountBuilderCall & { chainId: ChainId }

const Call = (props: CallProps) => {
  switch (props.call) {
    case 'createNode': {
      return <CreateNodeCall {...props} />
    }
    case 'assignRoles': {
      return <AssignRolesCall {...props} />
    }
    case 'setAllowance': {
      return <SetAllowanceCall {...props} />
    }
    case 'scopeTarget': {
      return <ScopeTargetCall {...props} />
    }
    case 'scopeFunction': {
      return <ScopeFunctionCall {...props} />
    }

    default: {
      return (
        <div className="text-xs">{`Missing node type for call "${props.call}"`}</div>
      )
    }
  }
}

const ScopeFunctionCall = (
  props: Extract<CallProps, { call: 'scopeFunction' }>,
) => (
  <FeedEntry action="Scope function" icon={SquareFunction} raw={props}>
    <LabeledItem label="Target">
      <LabeledAddress>{props.targetAddress}</LabeledAddress>
    </LabeledItem>

    <LabeledItem label="Role">
      <LabeledRoleKey>{props.roleKey}</LabeledRoleKey>
    </LabeledItem>
  </FeedEntry>
)

const ScopeTargetCall = (
  props: Extract<CallProps, { call: 'scopeTarget' }>,
) => (
  <FeedEntry icon={Crosshair} action="Scope target" raw={props}>
    <LabeledItem label="Target">
      <LabeledAddress>{props.targetAddress}</LabeledAddress>
    </LabeledItem>

    <LabeledItem label="Role">
      <LabeledRoleKey>{props.roleKey}</LabeledRoleKey>
    </LabeledItem>
  </FeedEntry>
)

const SetAllowanceCall = (
  props: Extract<CallProps, { call: 'setAllowance' }>,
) => (
  <FeedEntry icon={HandCoins} action="Set allowance" raw={props}>
    <LabeledItem label="Allowance">
      <NumberValue>{props.refill}</NumberValue>
    </LabeledItem>

    <LabeledItem label="Period">{parseRefillPeriod(props.period)}</LabeledItem>
  </FeedEntry>
)

const AssignRolesCall = (
  props: Extract<CallProps, { call: 'assignRoles' }>,
) => {
  return (
    <FeedEntry icon={UserRoundPlus} action="Add role member" raw={props}>
      <LabeledItem label="Member">
        <LabeledAddress>{props.member}</LabeledAddress>
      </LabeledItem>

      <LabeledItem label="Role">
        <LabeledRoleKey>{props.roleKey}</LabeledRoleKey>
      </LabeledItem>
    </FeedEntry>
  )
}

const CreateNodeCall = (props: Extract<CallProps, { call: 'createNode' }>) => {
  switch (props.accountType) {
    case AccountType.SAFE: {
      return (
        <FeedEntry icon={Plus} action="Create Safe" raw={props}>
          <LabeledItem label="Safe">
            <LabeledAddress>{props.deploymentAddress}</LabeledAddress>
          </LabeledItem>

          <LabeledItem label="Owners">
            <ul>
              {props.args.owners.map((owner) => (
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
        <FeedEntry icon={Plus} action="Create role" raw={props}>
          <LabeledItem label="Chain">
            <Chain chainId={props.chainId} />
          </LabeledItem>

          <LabeledItem label="Role">
            <LabeledAddress>{props.deploymentAddress}</LabeledAddress>
          </LabeledItem>

          <LabeledItem label="Target Safe">
            <LabeledAddress>{props.args.target}</LabeledAddress>
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
      <div className="grid grid-cols-10 items-center gap-4 text-sm">
        <div className="col-span-2 flex items-start justify-start gap-2">
          <div className="rounded-full border border-zinc-700 bg-zinc-800 p-1">
            <Icon className="size-3" />
          </div>

          {action}
        </div>

        {children && (
          <div className="col-span-7 col-start-3 grid grid-cols-4 gap-4">
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
