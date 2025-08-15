import {
  dbClient,
  getActivatedAccounts,
  getRoleActionAssets,
  getRoleActions,
} from '@zodiac/db'
import { Role } from '@zodiac/db/schema'
import { encodeRoleKey } from '@zodiac/modules'
import { Account, AccountType, withPredictedAddress } from 'ser-kit'
import {
  Allowance,
  Annotation,
  processPermissions,
  Target,
} from 'zodiac-roles-sdk'
import { Labels } from './AddressLabelContext'
import { computeSwapPermissions } from './computeSwapPermissions'
import { getRefillPeriod } from './getRefillPeriod'
import { Issue } from './issues'
import { RoleLabels } from './RoleLabelContext'

type Roles = Extract<Account, { type: AccountType.ROLES }>

type Result = {
  accounts: Roles[]
  labels: Labels
  roleLabels: RoleLabels
  issues: Issue[]
}

export const getRoleMods = async (
  role: Role,
  members: Account[],
): Promise<Result> => {
  const activeAccounts = await getActivatedAccounts(dbClient(), {
    roleId: role.id,
  })
  const actions = await getRoleActions(dbClient(), role.id)
  const assets = await getRoleActionAssets(dbClient(), {
    roleId: role.id,
  })

  if (activeAccounts.length === 0) {
    return {
      accounts: [],
      labels: {},
      roleLabels: {},
      issues: [Issue.NoActiveAccounts],
    }
  }

  return activeAccounts.reduce<Result>(
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
              key: encodeRoleKey(role.key),
              members: members.map((member) => member.address),
              annotations,
              targets,
            },
          ],
          target: activeAccount.address,
          version: 2,
        },
        activeAccount.nonce,
      )

      return {
        ...result,
        accounts: [...result.accounts, account],
        labels: {
          ...result.labels,
          [account.address]: role.label,
          [activeAccount.address]: activeAccount.label,
        },
        roleLabels: { ...result.roleLabels, [role.key]: role.label },
      }
    },
    { accounts: [], labels: {}, roleLabels: {}, issues: [] },
  )
}
