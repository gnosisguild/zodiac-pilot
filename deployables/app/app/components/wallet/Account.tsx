import { validateAddress } from '@/utils'
import { ProviderType } from '@zodiac/schema'
import { AddressInput, CopyToClipboard } from '@zodiac/ui'

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
        type === ProviderType.InjectedWallet ? 'MetaMask' : 'Wallet Connect'
      }
      action={
        <CopyToClipboard iconOnly size="small" data={address}>
          Copy address
        </CopyToClipboard>
      }
    />
  )
}
