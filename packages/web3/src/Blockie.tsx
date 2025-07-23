import type { HexAddress } from '@zodiac/schema'
import classNames from 'classnames'
import makeBlockie from 'ethereum-blockies-base64'
import { useMemo } from 'react'

interface Props {
  address: HexAddress
  className?: string
}

export const Blockie = ({ address, className }: Props) => {
  const blockie = useMemo(() => address && makeBlockie(address), [address])
  return (
    <div
      className={classNames('shrink-0 overflow-hidden rounded-full', className)}
    >
      <img src={blockie} alt="" aria-hidden className="block h-full" />
    </div>
  )
}
