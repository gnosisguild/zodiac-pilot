import { useAccount, useActivateAccount } from '@/accounts'
import { type Account } from '@/companion'
import { useTransactions } from '@/transactions'
import { CHAIN_NAME } from '@zodiac/chains'
import { Select, Tag } from '@zodiac/ui'
import { useEffect } from 'react'
import { ClearTransactionsModal } from './ClearTransactionsModal'

type AccountSelectProps = {
  accounts: Account[]
  onSelect: (accountId: string) => void
}

export const AccountSelect = ({ accounts, onSelect }: AccountSelectProps) => {
  const account = useAccount()
  const transactions = useTransactions()

  const [
    activateAccount,
    { isActivationPending, cancelActivation, proceedWithActivation },
  ] = useActivateAccount({ onActivate: onSelect })

  useEffect(() => {
    if (isActivationPending && transactions.length === 0) {
      proceedWithActivation()
    }
  }, [isActivationPending, proceedWithActivation, transactions.length])

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
