import { useAccount } from '@/accounts'
import { useCompanionAppUrl, useCompanionAppUser } from '@/companion'
import { useWindowId } from '@/port-handling'
import { useIsPending } from '@zodiac/hooks'
import {
  Divider,
  Form,
  GhostButton,
  GhostLinkButton,
  InlineForm,
  MeatballMenu,
} from '@zodiac/ui'
import { CloudOff, List, Pencil, RefreshCcw, User } from 'lucide-react'
import { Intent } from './intents'

export const AccountActions = () => {
  const account = useAccount()
  const user = useCompanionAppUser()
  const appUrl = useCompanionAppUrl()
  const windowId = useWindowId()
  const loggingIn = useIsPending(Intent.Login)

  return (
    <div className="flex shrink-0 items-center gap-1">
      <MeatballMenu label="Account actions" size="small">
        <InlineForm>
          <GhostButton
            submit
            icon={RefreshCcw}
            size="small"
            align="left"
            intent={Intent.RefreshAccount}
            busy={useIsPending(Intent.RefreshAccount)}
          >
            Refresh account
          </GhostButton>
        </InlineForm>

        <Divider />

        <Form context={{ accountId: account.id, windowId }}>
          <GhostButton
            submit
            align="left"
            busy={useIsPending(Intent.EditAccount)}
            intent={Intent.EditAccount}
            icon={Pencil}
            size="small"
          >
            Edit account
          </GhostButton>
        </Form>

        <Form context={{ windowId }}>
          <GhostButton
            submit
            align="left"
            busy={useIsPending(Intent.ListAccounts)}
            intent={Intent.ListAccounts}
            icon={List}
            size="small"
          >
            List accounts
          </GhostButton>
        </Form>

        <Divider />

        <Form>
          {user == null ? (
            <GhostButton
              submit
              align="left"
              intent={Intent.Login}
              size="small"
              icon={CloudOff}
              busy={loggingIn}
            >
              Log into Zodiac OS
            </GhostButton>
          ) : (
            <GhostLinkButton
              openInNewWindow
              to={`${appUrl}/profile`}
              size="small"
              align="left"
              icon={User}
            >
              View Profile
            </GhostLinkButton>
          )}
        </Form>
      </MeatballMenu>
    </div>
  )
}
