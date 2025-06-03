import type { ContractInfo } from '@/transactions'
import { EXPLORER_URL } from '@zodiac/chains'
import type { HexAddress } from '@zodiac/schema'
import { AddressInput, GhostLinkButton } from '@zodiac/ui'
import { SquareArrowOutUpRight } from 'lucide-react'
import type { ChainId } from 'ser-kit'

interface Props {
  chainId: ChainId
  address: HexAddress
  contractInfo?: ContractInfo
}

export const ContractAddress = ({ chainId, address, contractInfo }: Props) => {
  return (
    <AddressInput
      readOnly
      label="Contract"
      description={contractInfo?.name}
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
