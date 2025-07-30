import { invariant } from '@epic-web/invariant'
import { Account } from '@zodiac/db/schema'
import { MultiSelect } from '@zodiac/ui'
import { Address } from '@zodiac/web3'

type AccountSelectProps = {
  accounts: Account[]
  defaultValue?: Account[]
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
      defaultValue={defaultValue.map((account) => ({
        label: account.label,
        value: account.id,
      }))}
    >
      {({ data: { value } }) => {
        const account = accounts.find((account) => account.id === value)

        invariant(
          account != null,
          `Could not render account with id "${value}"`,
        )

        return <Address label={account.label}>{account.address}</Address>
      }}
    </MultiSelect>
  )
}
