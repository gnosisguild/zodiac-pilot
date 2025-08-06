import { authorizedLoader } from '@/auth-server'
import { invariantResponse } from '@epic-web/invariant'
import { Chain, ETH_ZERO_ADDRESS, ZERO_ADDRESS } from '@zodiac/chains'
import { dbClient, getActivatedAccounts, getRole } from '@zodiac/db'
import { getUUID } from '@zodiac/form-data'
import { isUUID } from '@zodiac/schema'
import {
  Account,
  AccountType,
  planApplyAccounts,
  predictAddress,
  prefixAddress,
  queryAccounts,
} from 'ser-kit'
import { Route } from './+types/deploy-draft'

export const loader = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async ({ request }) => {
      const data = await request.formData()
      const draft = await getRole(dbClient(), getUUID(data, 'draftId'))

      const activatedAccounts = await getActivatedAccounts(dbClient(), {
        roleId: draft.id,
      })

      const currentActivatedAccounts = await queryAccounts(
        activatedAccounts.map((account) =>
          prefixAddress(account.chainId, account.address),
        ),
      )

      const nonce = 1n

      const rolesMod = {
        type: AccountType.ROLES,
        address: ZERO_ADDRESS,
        prefixedAddress: ETH_ZERO_ADDRESS,
        chain: Chain.ETH,
        roles: [],
        allowances: [],
        avatar: ZERO_ADDRESS,
        owner: ZERO_ADDRESS,
        target: ZERO_ADDRESS,
        modules: [],
        version: 2,
        nonce,
        multisend: [],
      } satisfies Account

      const newAddress = predictAddress(rolesMod, nonce)

      const foo = await planApplyAccounts({
        desired: [
          ...currentActivatedAccounts.map((account) => {
            invariantResponse(
              account.type === AccountType.SAFE,
              'Account is not a safe',
            )

            return {
              type: AccountType.ROLES,
              avatar: account.address,
              owner: account.address,
              target: account.address,
              chain: account.chain,
              allowances: [],
              modules: [],
              roles: [],
              multisend: [],
              version: 2,
            } satisfies Account
          }),
        ],
      })

      return null
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
