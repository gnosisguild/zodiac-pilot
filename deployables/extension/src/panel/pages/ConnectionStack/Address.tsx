import { validateAddress } from '@/utils'
import type { HexAddress } from '@zodiac/schema'
import { Tag } from '@zodiac/ui'
import { Address as BaseAddress } from '@zodiac/web3'
import { Unlink } from 'lucide-react'

interface Props {
  address: HexAddress
}

export const Address = ({ address }: Props) => {
  const checksumAddress = validateAddress(address)

  return (
    <div className="flex h-10 items-center gap-2 text-xs">
      {checksumAddress && <BaseAddress shorten>{address}</BaseAddress>}

      {!address && (
        <Tag head={<Unlink size={14} />} color="amber">
          No Connection
        </Tag>
      )}
    </div>
  )
}
