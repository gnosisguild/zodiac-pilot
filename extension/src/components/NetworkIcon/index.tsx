import React from 'react'
import { ChainId } from 'ser-kit'
import PUBLIC_PATH from '../../publicPath'
import { CHAIN_ICON, CHAIN_NAME } from '../../chains'
import classes from './NetworkIcon.module.css'

interface NetworkIconProps {
  chainId: ChainId
  size?: number
}

const NetworkIcon: React.FC = ({ chainId, size = 24 }: NetworkIconProps) => {
  const iconUrl = PUBLIC_PATH + CHAIN_ICON[chainId]
  const alt = `${CHAIN_NAME[chainId]} Logo`
  return (
    <div className={classes.networkIconContainer} style={{ height: size, width: size }}>
      <img src={iconUrl} alt={alt} style={{ height: "100%", width: "100%" }} />
    </div>
  )
}

export default NetworkIcon
