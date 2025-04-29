import { useAccount } from '@/accounts'
import { useWindowId } from '@/inject-bridge'
import { Form, GhostButton, MeatballMenu } from '@zodiac/ui'
import { List, Pencil } from 'lucide-react'
import { useState } from 'react'
import { Intent } from './intents'

export const AccountActions = () => {
  const account = useAccount()
  const windowId = useWindowId()
  const [open, setOpen] = useState(false)

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
            intent={Intent.ListAccounts}
            icon={List}
            size="small"
          >
            List accounts
          </GhostButton>
        </Form>
      </MeatballMenu>
    </div>
  )
}
