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

      const { newSafes, allSafes } = await getMemberSafes(
        draft.id,
        activeChains,
      )
      const rolesMods = await getRolesMods(draft, allSafes)

      const desired = [...newSafes, ...rolesMods]

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
): Promise<{ newSafes: Account[]; allSafes: Account[] }> => {
  const members = await getRoleMembers(dbClient(), { roleId })

  const newSafes: Account[] = []
  const allSafes: Account[] = []

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
        newSafes.push(safe)
      }

      allSafes.push(safe)
    }
  }

  return { newSafes, allSafes }
}

const getRolesMods = async (
  draft: DbRole,
  members: Account[],
): Promise<Role[]> => {
  const activeAccounts = await getActivatedAccounts(dbClient(), {
    roleId: draft.id,
  })
  const actions = await getRoleActions(dbClient(), draft.id)

  return Promise.all(
    activeAccounts.map(async (account) =>
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
            key: encodeRoleKey(action.key),
            members: members.map((member) => member.address),
            annotations: [],
            targets: [],
          })),
          target: account.address,
          version: 2,
        },
        draft.nonce,
      ),
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
