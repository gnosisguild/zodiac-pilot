import { EXPLORER_URL } from '@zodiac/chains'
import type { HexAddress } from '@zodiac/schema'
import { AddressInput, GhostLinkButton } from '@zodiac/ui'
import { SquareArrowOutUpRight } from 'lucide-react'
import type { ChainId } from 'ser-kit'

interface Props {
  chainId: ChainId
  address: HexAddress
  label: string
  description?: string
}

export const AddressField = ({
  chainId,
  address,
  label,
  description,
}: Props) => {
  return (
    <AddressInput
      readOnly
      label={label}
      description={description}
      value={address}
      action={
        <GhostLinkButton
          openInNewWindow
          iconOnly
          size="small"
          to={`${EXPLORER_URL[chainId]}/search?q=${address}`}
          icon={SquareArrowOutUpRight}
        >
          Show in block explorer
        </GhostLinkButton>
      }
    />
  )
}
