import { AddressInput, CopyToClipboard } from '@/components'
import { ProviderType } from '@/types'
import { validateAddress } from '@/utils'

type AccountProps = {
  type: ProviderType
  children: string
}

export const Account = ({ children, type }: AccountProps) => {
  const address = validateAddress(children)

  return (
    <AddressInput
      readOnly
      value={address}
      label="Pilot Account"
      description={
        type === ProviderType.InjectedWallet ? 'Meta Mask' : 'Wallet Connect'
      }
      action={
        <CopyToClipboard iconOnly size="small" data={address}>
          Copy address
        </CopyToClipboard>
      }
    />
  )
}
