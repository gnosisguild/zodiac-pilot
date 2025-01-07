import { EXPLORER_URL } from '@/chains'
import { AddressInput, GhostLinkButton } from '@zodiac/ui'
import { getAddress } from 'ethers'
import { SquareArrowOutUpRight } from 'lucide-react'
import type { ChainId } from 'ser-kit'
import type { ContractInfo } from '../../../../utils/abi'

interface Props {
  chainId: ChainId
  address: string
  contractInfo?: ContractInfo
}

export const ContractAddress = ({ chainId, address, contractInfo }: Props) => {
  const explorerUrl = EXPLORER_URL[chainId]

  const checksumAddress = address && getAddress(address)

  return (
    <AddressInput
      readOnly
      label="Contract"
      description={contractInfo?.name}
      value={checksumAddress}
      action={
        <GhostLinkButton
          openInNewWindow
          iconOnly
          size="small"
          to={`${explorerUrl}/search?q=${address}`}
          icon={SquareArrowOutUpRight}
        >
          Show in block explorer
        </GhostLinkButton>
      }
    />
  )
}
