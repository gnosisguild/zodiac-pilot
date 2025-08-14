import { invariant } from '@epic-web/invariant'
import { chainName } from '@zodiac/chains'
import { Account } from '@zodiac/db/schema'
import { MultiSelect, Tag } from '@zodiac/ui'
import { Address } from '@zodiac/web3'
import { UUID } from 'node:crypto'

type AccountSelectProps = {
  accounts: Account[]
  defaultValue?: UUID[]
}

export const AccountSelect = ({
  accounts,
  defaultValue = [],
}: AccountSelectProps) => {
  return (
    <MultiSelect
      label="Accounts"
      name="accounts"
      placeholder="Accounts this role should be activated on"
      options={accounts.map((account) => ({
        label: account.label,
        value: account.id,
      }))}
      defaultValue={defaultValue}
    >
      {({ data: { value } }) => {
        const account = accounts.find((account) => account.id === value)

        invariant(
          account != null,
          `Could not render account with id "${value}"`,
        )

        return (
          <div className="flex justify-between gap-2">
            <Address shorten label={account.label}>
              {account.address}
            </Address>
            <Tag color="gray">{chainName(account.chainId)}</Tag>
          </div>
        )
      }}
    </MultiSelect>
  )
}
