import cn from 'classnames'
import copy from 'copy-to-clipboard'
import React from 'react'
import { RiExternalLinkLine, RiFileCopyLine } from 'react-icons/ri'
import { EXPLORER_URL } from '../../chains'

import { useRoute } from '../../routes'
import { validateAddress } from '../../utils'
import Blockie from '../Blockie'
import Box from '../Box'
import IconButton from '../IconButton'

import classes from './style.module.css'

interface Props {
  address: string
  explorerLink?: boolean
  copyToClipboard?: boolean
  className?: string
}

const VISIBLE_START = 4
const VISIBLE_END = 4

export const shortenAddress = (address: string): string => {
  const checksumAddress = validateAddress(address)
  const start = checksumAddress.substring(0, VISIBLE_START + 2)
  const end = checksumAddress.substring(42 - VISIBLE_END, 42)
  return `${start}...${end}`
}

const Address: React.FC<Props> = ({
  address,
  explorerLink,
  copyToClipboard,
  className,
}) => {
  const { chainId } = useRoute()
  const explorerUrl = chainId && EXPLORER_URL[chainId]
  const checksumAddress = validateAddress(address)
  const displayAddress = shortenAddress(checksumAddress)

  return (
    <Box rounded className={cn(classes.container, className)}>
      <div className={classes.address}>
        {checksumAddress ? displayAddress : 'No connection'}
      </div>
      <Box rounded className={classes.blockieContainer}>
        {address && <Blockie address={address} className={classes.blockies} />}
        {!address && <div className={classes.noAddress} />}
      </Box>
      {copyToClipboard && (
        <IconButton
          onClick={() => {
            copy(checksumAddress)
          }}
        >
          <RiFileCopyLine />
        </IconButton>
      )}
      {explorerLink && (
        <a
          href={`${explorerUrl}/search?q=${address}`}
          target="_blank"
          className={classes.link}
          title={address}
          rel="noreferrer"
        >
          <RiExternalLinkLine />
        </a>
      )}
    </Box>
  )
}

export default Address
