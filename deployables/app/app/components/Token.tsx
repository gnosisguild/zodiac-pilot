import { isHexAddress } from '@zodiac/schema'
import { Popover } from '@zodiac/ui'
import { Address } from '@zodiac/web3'
import { CircleDollarSign } from 'lucide-react'
import type { PropsWithChildren } from 'react'

type TokenProps = PropsWithChildren<{
  logo?: string | null
  contract?: string
}>

export const Token = ({ children, logo, contract }: TokenProps) => {
  return (
    <Popover
      popover={
        isHexAddress(contract) && <Address size="small">{contract}</Address>
      }
    >
      <div className="flex items-center gap-2 overflow-hidden">
        {logo ? (
          <img src={logo} alt="" className="size-4 rounded-full" />
        ) : (
          <div className="flex size-4 items-center justify-center">
            <CircleDollarSign size={16} className="opacity-50" />
          </div>
        )}

        <span className="overflow-hidden text-ellipsis whitespace-nowrap">
          {children}
        </span>
      </div>
    </Popover>
  )
}
