import { EXPLORER_URL } from '@/chains'
import { BlockLink, Circle, RawAddress } from '@/components'
import makeBlockie from 'ethereum-blockies-base64'
import { getAddress } from 'ethers'
import { useMemo } from 'react'
import { RiExternalLinkLine } from 'react-icons/ri'
import { ChainId } from 'ser-kit'
import { ContractInfo } from '../../../utils/abi'

interface Props {
  chainId: ChainId
  address: string
  contractInfo?: ContractInfo
  className?: string
}

const VISIBLE_START = 4
const VISIBLE_END = 4

export const ContractAddress = ({ chainId, address, contractInfo }: Props) => {
  const explorerUrl = EXPLORER_URL[chainId]

  const blockie = useMemo(() => address && makeBlockie(address), [address])

  const checksumAddress = address && getAddress(address)
  const start = checksumAddress.substring(0, VISIBLE_START + 2)
  const end = checksumAddress.substring(42 - VISIBLE_END, 42)
  const displayAddress = `${start}...${end}`

  return (
    <div className="flex items-center gap-2">
      <Circle size="sm">
        <img src={blockie} alt={address} />
      </Circle>

      <div className="flex flex-col gap-1">
        {contractInfo?.name && (
          <div className="flex-shrink-0 text-xs font-bold uppercase">
            {contractInfo?.name}
          </div>
        )}

        <div className="flex items-center gap-2 text-xs">
          <RawAddress>{displayAddress}</RawAddress>

          <BlockLink
            href={`${explorerUrl}/search?q=${address}`}
            target="_blank"
            title="Show in block explorer"
            rel="noreferrer"
          >
            <RiExternalLinkLine className="size-4" />
          </BlockLink>
        </div>
      </div>
    </div>
  )
}
