import classNames from 'classnames'
import makeBlockie from 'ethereum-blockies-base64'
import { useMemo } from 'react'

interface Props {
  address: string
  className?: string
}

export const Blockie = ({ address, className }: Props) => {
  const blockie = useMemo(() => address && makeBlockie(address), [address])
  return (
    <div className={classNames('overflow-hidden rounded-full', className)}>
      <img src={blockie} alt={address} className="block h-full" />
    </div>
  )
}
