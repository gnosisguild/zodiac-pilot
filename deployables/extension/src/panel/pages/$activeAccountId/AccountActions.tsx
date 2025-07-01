import { useAccount } from '@/accounts'
import { useCompanionAppUrl, useCompanionAppUser } from '@/companion'
import { useWindowId } from '@/port-handling'
import { useAfterSubmit, useIsPending, useStableHandler } from '@zodiac/hooks'
import {
  Divider,
  Form,
  GhostButton,
  GhostLinkButton,
  MeatballMenu,
} from '@zodiac/ui'
import { CloudOff, List, Pencil, RefreshCcw, User } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useRevalidator } from 'react-router'
import { Intent } from './intents'

export const AccountActions = () => {
  const account = useAccount()
  const user = useCompanionAppUser()
  const appUrl = useCompanionAppUrl()
  const windowId = useWindowId()
  const [open, setOpen] = useState(false)
  const loggingIn = useIsPending(Intent.Login)

  useAfterSubmit([Intent.EditAccount, Intent.ListAccounts], () =>
    setOpen(false),
  )

  return (
    <div className="flex shrink-0 items-center gap-1">
      <MeatballMenu
        open={open}
        label="Account actions"
        size="small"
        onRequestShow={() => setOpen(true)}
        onRequestHide={() => setOpen(false)}
      >
        <Refresh onRefresh={() => setOpen(false)} />

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
              onClick={() => setOpen(false)}
            >
              View Profile
            </GhostLinkButton>
          )}
        </Form>
      </MeatballMenu>
    </div>
  )
}

const Refresh = ({ onRefresh }: { onRefresh: () => void }) => {
  const revalidator = useRevalidator()

  const onRefreshRef = useStableHandler(onRefresh)
  const stateRef = useRef(revalidator.state)

  useEffect(() => {
    if (revalidator.state === 'idle' && stateRef.current === 'loading') {
      onRefreshRef.current()
    }

    stateRef.current = revalidator.state
  }, [onRefreshRef, revalidator.state])

  return (
    <GhostButton
      icon={RefreshCcw}
      size="small"
      align="left"
      onClick={() => revalidator.revalidate()}
      busy={revalidator.state === 'loading'}
    >
      Refresh account
    </GhostButton>
  )
}
