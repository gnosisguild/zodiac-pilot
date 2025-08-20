import {
  dbClient,
  getActivatedAccounts,
  getRoleActionAssets,
  getRoleActions,
} from '@zodiac/db'
import {
  Account as DBAccount,
  Role,
  RoleDeploymentIssue,
} from '@zodiac/db/schema'
import { encodeRoleKey } from '@zodiac/modules'
import { UUID } from 'crypto'
import { Account, AccountType, prefixAddress, queryAccounts } from 'ser-kit'
import {
  Allowance,
  Annotation,
  processPermissions,
  Target,
} from 'zodiac-roles-sdk'
import { Labels } from './AddressLabelContext'
import { computeSwapPermissions } from './computeSwapPermissions'
import { getRefillPeriod } from './getRefillPeriod'
import { predictRolesModAddress, Roles } from './predictRolesModAddress'
import { RoleLabels } from './RoleLabelContext'

type Result = {
  rolesMods: Roles[]
  modLabels: Labels
  roleLabels: RoleLabels
  issues: RoleDeploymentIssue[]
}

type GetRoleModsOptions = {
  members: Account[]
}

export const getRoleMods = async (
  role: Role,
  { members }: GetRoleModsOptions,
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
      rolesMods: [],
      modLabels: {},
      roleLabels: {},
      issues: [RoleDeploymentIssue.NoActiveAccounts],
    }
  }

  const currentMods = await getCurrentMods(activeAccounts)

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

      const existingMod = currentMods[activeAccount.id]

      const existingRoles = (existingMod?.roles || []).filter(
        (currentRole) => currentRole.key !== encodeRoleKey(role.key),
      )

      const roleDefinition = {
        key: encodeRoleKey(role.key),
        members: members.map((member) => member.address),
        annotations,
        targets,
      }

      const address = predictRolesModAddress(activeAccount)

      const mod = {
        address,
        prefixedAddress: prefixAddress(activeAccount.chainId, address),
        nonce: activeAccount.nonce,

        avatar: activeAccount.address,
        chain: activeAccount.chainId,
        modules: [],
        multisend: [],
        owner: activeAccount.address,
        target: activeAccount.address,
        version: 2,

        ...existingMod,

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

        roles: [...existingRoles, roleDefinition],
      } satisfies Roles

      return {
        ...result,
        rolesMods: [...result.rolesMods, mod],
        modLabels: {
          ...result.modLabels,
          [mod.address]: role.label,
          [activeAccount.address]: activeAccount.label,
        },
        roleLabels: { ...result.roleLabels, [role.key]: role.label },
      }
    },
    { rolesMods: [], modLabels: {}, roleLabels: {}, issues: [] },
  )
}

const getCurrentMods = async (
  accounts: DBAccount[],
): Promise<Record<UUID, Roles | undefined>> => {
  const existingMods = await Promise.all(
    accounts.map(async (account) => {
      const [rolesMod] = await queryAccounts([
        prefixAddress(account.chainId, predictRolesModAddress(account)),
      ])

      return [account.id, rolesMod]
    }),
  )

  return Object.fromEntries(existingMods)
}
