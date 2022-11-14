import cn from 'classnames'
import copy from 'copy-to-clipboard'
import React from 'react'
import { RiExternalLinkLine, RiFileCopyLine } from 'react-icons/ri'

import { useConnection } from '../../settings'
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

const EXPLORER_URLS: Record<string, string | undefined> = {
  '1': 'https://etherscan.io',
  '4': 'https://rinkeby.etherscan.io',
  '100': 'https://blockscout.com/xdai/mainnet',
  '73799': 'https://volta-explorer.energyweb.org',
  '246': 'https://explorer.energyweb.org',
  '137': 'https://polygonscan.com',
  '56': 'https://bscscan.com',
  '42161': 'https://arbiscan.io',
}

export const shortenAddress = (address: string): string => {
  const start = address.substring(0, VISIBLE_START + 2)
  const end = address.substring(42 - VISIBLE_END, 42)
  return `${start}...${end}`
}

const Address: React.FC<Props> = ({
  address,
  explorerLink,
  copyToClipboard,
  className,
}) => {
  const {
    connection: { chainId },
  } = useConnection()
  const explorerUrl = chainId && EXPLORER_URLS[chainId]

  const displayAddress = shortenAddress(address)

  return (
    <Box rounded className={cn(className, classes.container)}>
      <div className={classes.address}>{displayAddress}</div>
      <Box rounded>
        {address && <Blockie address={address} className={classes.blockies} />}
      </Box>
      {copyToClipboard && (
        <IconButton
          onClick={() => {
            copy(address)
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
