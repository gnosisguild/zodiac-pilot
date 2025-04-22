import { useAccount, type Account } from '@/companion'
import { useWindowId } from '@/inject-bridge'
import { CHAIN_NAME } from '@zodiac/chains'
import { Blockie, Form, GhostButton, Select, Tag } from '@zodiac/ui'
import { List, Pencil } from 'lucide-react'
import { useSubmit } from 'react-router'
import { ClearTransactionsModal } from '../ClearTransactionsModal'
import { useLaunchRoute } from '../useLaunchRoute'
import { Intent } from './intents'

type AccountSelectProps = {
  accounts: Account[]
}

export const AccountSelect = ({ accounts }: AccountSelectProps) => {
  const account = useAccount()
  const windowId = useWindowId()
  const submit = useSubmit()
  const [launchRoute, { isLaunchPending, cancelLaunch, proceedWithLaunch }] =
    useLaunchRoute({
      onLaunch(accountId) {
        submit(
          { intent: Intent.ActivateAccount, accountId },
          { method: 'POST' },
        )
      },
    })

  return (
    <>
      <div className="flex items-center gap-2 pl-4">
        <Blockie address={account.address} className="size-6" />

        <Select
          inline
          isClearable={false}
          isMulti={false}
          isSearchable={false}
          className="flex-1"
          label="Safe Accounts"
          onChange={(option) => {
            if (option == null) {
              return
            }

            launchRoute(option.value)
          }}
          value={{ value: account.id }}
          options={accounts.map((account) => ({ value: account.id }))}
        >
          {({ data: { value } }) => {
            const account = accounts.find(({ id }) => id === value)

            return account == null ? (
              'Unnamed route'
            ) : (
              <div className="flex max-w-full items-center justify-between gap-2 overflow-hidden">
                <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                  {account.label}
                </span>
                <Tag color="gray">{CHAIN_NAME[account.chainId]}</Tag>
              </div>
            )
          }}
        </Select>

        <div className="mr-4 flex shrink-0 items-center gap-1">
          <Form context={{ accountId: account.id, windowId }}>
            <GhostButton
              submit
              iconOnly
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
              iconOnly
              intent={Intent.ListAccounts}
              icon={List}
              size="small"
            >
              List accounts
            </GhostButton>
          </Form>
        </div>
      </div>

      <ClearTransactionsModal
        open={isLaunchPending}
        onCancel={cancelLaunch}
        onAccept={proceedWithLaunch}
      />
    </>
  )
}
