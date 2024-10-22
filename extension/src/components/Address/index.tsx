import { shortenAddress, validateAddress } from '@/utils'
import cn from 'classnames'
import copy from 'copy-to-clipboard'
import React from 'react'
import { RiExternalLinkLine, RiFileCopyLine } from 'react-icons/ri'
import { EXPLORER_URL } from '../../chains'
import { useRoute } from '../../panel/routes'
import { Blockie } from '../Blockie'
import Box from '../Box'
import IconButton from '../IconButton'
import classes from './style.module.css'

interface Props {
  address: string
  explorerLink?: boolean
  copyToClipboard?: boolean
  className?: string
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
