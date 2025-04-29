import { useAccount } from '@/accounts'
import { type Account } from '@/companion'
import { CHAIN_NAME } from '@zodiac/chains'
import { Select, Tag } from '@zodiac/ui'
import { ClearTransactionsModal } from '../ClearTransactionsModal'
import { useActivateAccount } from '../useActivateAccount'

type AccountSelectProps = {
  accounts: Account[]
  onSelect: (accountId: string) => void
}

export const AccountSelect = ({ accounts, onSelect }: AccountSelectProps) => {
  const account = useAccount()

  const [
    activateAccount,
    { isActivationPending, cancelActivation, proceedWithActivation },
  ] = useActivateAccount({ onActivate: onSelect })

  return (
    <>
      <Select
        inline
        isClearable={false}
        isMulti={false}
        isSearchable={false}
        label="Safe Accounts"
        onChange={(option) => {
          if (option == null) {
            return
          }

          activateAccount(option.value)
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

      <ClearTransactionsModal
        open={isActivationPending}
        onCancel={cancelActivation}
        onAccept={proceedWithActivation}
      />
    </>
  )
}
