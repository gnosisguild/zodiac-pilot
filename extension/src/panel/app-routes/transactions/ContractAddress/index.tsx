import { EXPLORER_URL } from '@/chains'
import { Address, Circle } from '@/components'
import makeBlockie from 'ethereum-blockies-base64'
import { getAddress } from 'ethers'
import { SquareArrowOutUpRight } from 'lucide-react'
import { useMemo } from 'react'
import { ChainId } from 'ser-kit'
import { ContractInfo } from '../../../utils/abi'

interface Props {
  chainId: ChainId
  address: string
  contractInfo?: ContractInfo
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
      <Circle>
        <img src={blockie} alt={address} className="size-8 rounded-full" />
      </Circle>

      <div className="flex flex-col gap-2">
        {contractInfo?.name && (
          <div className="flex flex-shrink-0 gap-1 overflow-hidden text-ellipsis whitespace-nowrap text-xs font-bold">
            Contract
            <span className="font-normal">({contractInfo.name})</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs">
          <Address>{displayAddress}</Address>

          <a
            href={`${explorerUrl}/search?q=${address}`}
            target="_blank"
            title="Show in block explorer"
            rel="noreferrer"
          >
            <SquareArrowOutUpRight size={16} />
          </a>
        </div>
      </div>
    </div>
  )
}
