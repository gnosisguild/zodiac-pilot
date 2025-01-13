import { AddressInput, CopyToClipboard } from '@zodiac/ui'
import { useAccount } from 'wagmi'

export const Account = () => {
  const { address, connector } = useAccount()

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
