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
import { UUID } from 'crypto'
import {
  Account,
  AccountType,
  ChainId,
  planApplyAccounts,
  prefixAddress,
  queryAccounts,
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

      const currentActivatedAccounts = await queryAccounts(
        activatedAccounts.map((account) =>
          prefixAddress(account.chainId, account.address),
        ),
      )

      const memberSafes = await getMemberSafes(draft.id, activeChains)

      return {
        plan: await planApplyAccounts({
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

const DeployDraft = () => {
  return null
}

export default DeployDraft

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
