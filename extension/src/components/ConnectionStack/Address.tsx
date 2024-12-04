import { shortenAddress, validateAddress } from '@/utils'
import { Unlink } from 'lucide-react'
import { Address as BaseAddress } from '../Address'
import { Blockie } from '../Blockie'
import { Tag } from '../Tag'

interface Props {
  address: string
}

export const Address = ({ address }: Props) => {
  const checksumAddress = validateAddress(address)
  const displayAddress = shortenAddress(checksumAddress)

  return (
    <div className="flex h-10 items-center gap-2 text-xs">
      {address && (
        <>
          <Blockie address={address} className="size-6" />

          <BaseAddress>
            {checksumAddress ? displayAddress : 'No connection'}
          </BaseAddress>
        </>
      )}

      {!address && (
        <Tag head={<Unlink size={14} />} color="warning">
          No Connection
        </Tag>
      )}
    </div>
  )
}
