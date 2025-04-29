import { useAccount } from '@/accounts'
import { useCompanionAppUser } from '@/companion'
import { useWindowId } from '@/inject-bridge'
import { useAfterSubmit, useIsPending } from '@zodiac/hooks'
import {
  Divider,
  Feature,
  Form,
  GhostButton,
  InlineForm,
  MeatballMenu,
} from '@zodiac/ui'
import { Cloud, CloudOff, List, Pencil } from 'lucide-react'
import { useState } from 'react'
import { Intent } from './intents'

export const AccountActions = () => {
  const account = useAccount()
  const user = useCompanionAppUser()
  const windowId = useWindowId()
  const [open, setOpen] = useState(false)

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

        <Feature feature="user-management">
          <Divider />
          <InlineForm>
            {user == null ? (
              <GhostButton
                submit
                align="left"
                intent={Intent.Login}
                size="small"
                icon={CloudOff}
              >
                Log into Zodiac OS
              </GhostButton>
            ) : (
              <GhostButton size="small" align="left" icon={Cloud}>
                View Profile
              </GhostButton>
            )}
          </InlineForm>
        </Feature>
      </MeatballMenu>
    </div>
  )
}
