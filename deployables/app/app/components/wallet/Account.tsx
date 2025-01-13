import { validateAddress } from '@/utils'
import { AddressInput, CopyToClipboard } from '@zodiac/ui'
import { useAccount } from 'wagmi'

export const Account = ({ children }: { children: string }) => {
  const { connector } = useAccount()
  const address = validateAddress(children)

  return (
    <AddressInput
      readOnly
      value={address}
      label="Pilot Account"
      description={connector?.name}
      action={
        <CopyToClipboard iconOnly size="small" data={address}>
          Copy address
        </CopyToClipboard>
      }
    />
  )
}
