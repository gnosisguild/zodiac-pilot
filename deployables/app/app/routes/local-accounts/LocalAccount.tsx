import { useIsSignedIn } from '@/auth-client'
import { Chain } from '@/routes-ui'
import { useOptionalWorkspaceId } from '@/workspaces'
import { invariant } from '@epic-web/invariant'
import { getChainId, ZERO_ADDRESS } from '@zodiac/chains'
import { useIsPending } from '@zodiac/hooks'
import { CompanionAppMessageType, companionRequest } from '@zodiac/messages'
import { encode, type ExecutionRoute } from '@zodiac/schema'
import {
  Address,
  Form,
  GhostButton,
  GhostLinkButton,
  MeatballMenu,
  TableCell,
  TableRow,
  TableRowActions,
  Tag,
} from '@zodiac/ui'
import { Pencil, Trash2, UploadIcon } from 'lucide-react'
import { href, useSubmit } from 'react-router'
import { Intent } from './intents'

type LocalAccountProps = { route: ExecutionRoute; active: boolean }

export const LocalAccount = ({ route, active }: LocalAccountProps) => {
  const chainId = getChainId(route.avatar)

  return (
    <TableRow className="group" href={useAccountUrl(route.id)}>
      <TableCell aria-describedby={route.id}>{route.label}</TableCell>
      <TableCell>
        {active && (
          <Tag id={route.id} color="green">
            Active
          </Tag>
        )}
      </TableCell>
      <TableCell>
        <Chain chainId={chainId} />
      </TableCell>
      <TableCell>
        {route.initiator == null ? (
          <Address>{ZERO_ADDRESS}</Address>
        ) : (
          <Address shorten>{route.initiator}</Address>
        )}
      </TableCell>
      <TableCell>
        <Address shorten>{route.avatar}</Address>
      </TableCell>
      <TableCell>
        <TableRowActions>
          <Actions routeId={route.id} />
        </TableRowActions>
      </TableCell>
    </TableRow>
  )
}

const Actions = ({ routeId }: { routeId: string }) => {
  const workspaceId = useOptionalWorkspaceId()

  return (
    <MeatballMenu size="tiny" label="Account options">
      {useIsSignedIn() && <Upload routeId={routeId} />}

      <GhostLinkButton
        to={href('/offline/accounts/:accountId', { accountId: routeId })}
        align="left"
        size="tiny"
        icon={Pencil}
      >
        Edit
      </GhostLinkButton>

      <GhostLinkButton
        to={
          workspaceId
            ? href('/workspace/:workspaceId/local-accounts/delete/:accountId', {
                workspaceId,
                accountId: routeId,
              })
            : href('/offline/accounts/delete/:accountId', {
                accountId: routeId,
              })
        }
        align="left"
        size="tiny"
        icon={Trash2}
        style="critical"
      >
        Delete
      </GhostLinkButton>
    </MeatballMenu>
  )
}

const Upload = ({ routeId }: { routeId: string }) => {
  const submit = useSubmit()

  return (
    <Form
      intent={Intent.Upload}
      context={{ routeId }}
      onSubmit={(event) => {
        const data = new FormData(event.currentTarget)

        const { promise, resolve, reject } =
          Promise.withResolvers<ExecutionRoute>()

        companionRequest(
          { type: CompanionAppMessageType.REQUEST_ROUTE, routeId },
          ({ route }) => {
            if (route == null) {
              reject(`Route with id "${routeId}" not found`)
            } else {
              resolve(route)
            }
          },
        )

        promise.then((route) => {
          data.set('route', encode(route))

          submit(data, { method: 'POST' })
        })

        event.preventDefault()
        event.stopPropagation()
      }}
    >
      <GhostButton
        submit
        size="tiny"
        align="left"
        busy={useIsPending(Intent.Upload)}
        icon={UploadIcon}
      >
        Upload
      </GhostButton>
    </Form>
  )
}

const useAccountUrl = (accountId: string) => {
  const isSignedIn = useIsSignedIn()
  const workspaceId = useOptionalWorkspaceId()

  if (isSignedIn) {
    invariant(workspaceId != null, 'A signed in user needs a workspace')

    return href('/workspace/:workspaceId/local-accounts/:accountId', {
      workspaceId,
      accountId,
    })
  }

  return href('/offline/accounts/:accountId', { accountId })
}
