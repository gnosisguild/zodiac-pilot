import { shortenAddress, validateAddress } from '@/utils'
import { Unlink } from 'lucide-react'
import { Blockie } from '../Blockie'
import { RawAddress } from '../RawAddress'
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

          <RawAddress>
            {checksumAddress ? displayAddress : 'No connection'}
          </RawAddress>
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
