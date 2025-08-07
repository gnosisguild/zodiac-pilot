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
import { encodeRoleKey } from '@zodiac/modules'
import { isUUID, jsonStringify } from '@zodiac/schema'
import { Modal } from '@zodiac/ui'
import { UUID } from 'crypto'
import { Suspense } from 'react'
import { Await, href, useNavigate } from 'react-router'
import {
  Account,
  AccountType,
  ChainId,
  planApplyAccounts,
  queryAccounts,
  withPredictedAddress,
} from 'ser-kit'
import { Route } from './+types/deploy-draft'

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

      const memberSafes = await getMemberSafes(draft.id, activeChains)
      const rolesMods = await getRolesMods(draft.id, draft.nonce)

      const desired = [...memberSafes, ...rolesMods]

      console.log(jsonStringify(desired, 2))

      return {
        plan: planApplyAccounts({
          // TODO: remove this
          current: [],
          desired,
        }),
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
): Promise<Account[]> => {
  const members = await getRoleMembers(dbClient(), { roleId })

  const safes: Account[] = []

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

      if (existingSafe == null) {
        safes.push(safe)
      }
    }
  }

  return safes
}

const getRolesMods = async (roleId: UUID, nonce: bigint): Promise<Role[]> => {
  const activeAccounts = await getActivatedAccounts(dbClient(), { roleId })
  const actions = await getRoleActions(dbClient(), roleId)

  return activeAccounts.map((account) =>
    withPredictedAddress<Role>(
      {
        type: AccountType.ROLES,
        allowances: [],
        avatar: account.address,
        chain: account.chainId,
        modules: [],
        multisend: [],
        owner: account.address,
        roles: actions.map((action) => ({
          key: encodeRoleKey(action.label),
          members: [],
          annotations: [],
          targets: [],
          lastUpdate: 0,
        })),
        target: account.address,
        version: 2,
      },
      nonce,
    ),
  )
}

const DeployDraft = ({
  loaderData: { plan },
  params: { workspaceId },
}: Route.ComponentProps) => {
  const navigate = useNavigate()

  return (
    <Modal
      open
      title="Deploy draft"
      onClose={() =>
        navigate(href('/workspace/:workspaceId/roles/drafts', { workspaceId }))
      }
    >
      <Suspense>
        <Await resolve={plan}>
          {(plan) =>
            plan.map(({ account, steps }) => (
              <div key={account.prefixedAddress}>
                {steps.map((step, index) => (
                  <div key={index}>{step.call.call}</div>
                ))}
              </div>
            ))
          }
        </Await>
      </Suspense>

      <Modal.Actions>
        <Modal.CloseAction>Close</Modal.CloseAction>
      </Modal.Actions>
    </Modal>
  )
}

export default DeployDraft
