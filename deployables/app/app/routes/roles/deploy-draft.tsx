import { authorizedLoader } from '@/auth-server'
import { invariantResponse } from '@epic-web/invariant'
import {
  dbClient,
  getActivatedAccounts,
  getDefaultWallets,
  getRole,
  getRoleMembers,
} from '@zodiac/db'
import { isUUID } from '@zodiac/schema'
import { Modal } from '@zodiac/ui'
import { UUID } from 'crypto'
import { Suspense } from 'react'
import { Await, href, useNavigate } from 'react-router'
import {
  Account,
  AccountType,
  ChainId,
  planApplyAccounts,
  withPredictedAddress,
} from 'ser-kit'
import { Route } from './+types/deploy-draft'

type Safe = Extract<Account, { type: AccountType.SAFE }>

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

      return {
        plan: planApplyAccounts({
          desired: [...memberSafes],
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

      safes.push(
        withPredictedAddress<Safe>(
          {
            type: AccountType.SAFE,
            chain: chainId,
            modules: [],
            owners: [defaultWallets[chainId].address],
            threshold: 1,
          },
          member.nonce,
        ),
      )
    }
  }

  return safes
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
      <Modal.Actions>
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
        <Modal.CloseAction>Close</Modal.CloseAction>
      </Modal.Actions>
    </Modal>
  )
}

export default DeployDraft
