import { validateAddress } from '@zodiac/schema'
import { CopyToClipboard } from '@zodiac/ui'
import { AddressInput } from './AddressInput'

type AccountProps = {
  children: string
}

export const Account = ({ children }: AccountProps) => {
  const address = validateAddress(children)

  return (
    <AddressInput
      readOnly
      value={address ?? undefined}
      label="Pilot Signer"
      action={
        <CopyToClipboard iconOnly size="small" data={address}>
          Copy address
        </CopyToClipboard>
      }
    />
  )
}
