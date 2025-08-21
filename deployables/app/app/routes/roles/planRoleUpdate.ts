import { dbClient, getRole } from '@zodiac/db'
import { UUID } from 'crypto'
import { planApplyAccounts } from 'ser-kit'
import { getMemberSafes } from './getMemberSafes'
import { getRoleMods } from './getRoleMods'

export const planRoleUpdate = async (roleId: UUID) => {
  const role = await getRole(dbClient(), roleId)

  const {
    safes,
    memberLabels,
    issues: memberIssues,
  } = await getMemberSafes(role)
  const {
    rolesMods,
    modLabels,
    roleLabels,
    issues: roleIssues,
  } = await getRoleMods(role, { members: safes })

  const plan = await planApplyAccounts({
    desired: [...safes, ...rolesMods],
  })

  return {
    labels: { ...memberLabels, ...modLabels },
    roleLabels,
    issues: [...roleIssues, ...memberIssues],
    plan,
  }
}
