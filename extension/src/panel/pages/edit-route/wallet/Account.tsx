import { AddressInput, GhostButton, infoToast } from '@/components'
import { ProviderType } from '@/types'
import { validateAddress } from '@/utils'
import { Copy } from 'lucide-react'

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
        <GhostButton
          iconOnly
          size="small"
          icon={Copy}
          onClick={() => {
            navigator.clipboard.writeText(JSON.stringify(address, undefined, 2))
            infoToast({
              title: 'Copied!',
              message: 'Address has been copied to clipboard.',
            })
          }}
        >
          Copy address
        </GhostButton>
      }
    />
  )
}
