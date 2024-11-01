import classNames from 'classnames'
import makeBlockie from 'ethereum-blockies-base64'
import { useMemo } from 'react'

import classes from './style.module.css'

interface Props {
  address: string
  className?: string
}

export const Blockie = ({ address, className }: Props) => {
  const blockie = useMemo(() => address && makeBlockie(address), [address])
  return (
    <div className={classNames(classes.container, className)}>
      <img src={blockie} alt={address} />
    </div>
  )
}
