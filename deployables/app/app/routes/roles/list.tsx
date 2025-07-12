import { authorizedLoader } from '@/auth-server'
import { Page } from '@/components'
import { FetchRolesDocument } from '@/graphql'
import { graphqlClient } from '@/graphql-client'
import { invariantResponse } from '@epic-web/invariant'
import { dbClient, getAccounts, getWorkspace } from '@zodiac/db'
import { isUUID } from '@zodiac/schema'
import type { Route } from './+types/list'

export const loader = (args: Route.LoaderArgs) =>
  authorizedLoader(
    args,
    async ({
      params: { workspaceId },
      context: {
        auth: { tenant },
      },
    }) => {
      invariantResponse(isUUID(workspaceId), '"workspaceId" is no UUID')

      const accounts = await getAccounts(dbClient(), {
        workspaceId,
        tenantId: tenant.id,
      })

      const roles = await Promise.all(
        accounts.flatMap(async (account) => {
          const { rolesModifiers } = await graphqlClient().query(
            FetchRolesDocument,
            { account: account.address },
          )

          return rolesModifiers.flatMap(({ roles }) => roles)
        }),
      )

      return { roles: roles.flat() }
    },
    {
      ensureSignedIn: true,
      async hasAccess({ params: { workspaceId }, tenant }) {
        invariantResponse(isUUID(workspaceId), '"workspaceId" is no UUID')

        const workspace = await getWorkspace(dbClient(), workspaceId)

        return workspace.tenantId === tenant.id
      },
    },
  )

const Roles = ({ loaderData: { roles } }: Route.ComponentProps) => {
  return (
    <Page>
      <Page.Header>Roles</Page.Header>
      <Page.Main>
        {roles.map((role) => (
          <div key={role.id}>
            {role.key} {role.id}
          </div>
        ))}
      </Page.Main>
    </Page>
  )
}

export default Roles
