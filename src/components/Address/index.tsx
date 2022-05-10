import cn from 'classnames'
import copy from 'copy-to-clipboard'
import makeBlockie from 'ethereum-blockies-base64'
import React, { useMemo } from 'react'
import { RiExternalLinkLine, RiFileCopyLine } from 'react-icons/ri'

import { useWalletConnectProvider } from '../../providers'
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

const Address: React.FC<Props> = ({
  address,
  explorerLink,
  copyToClipboard,
  className,
}) => {
  const { provider } = useWalletConnectProvider()
  const explorerUrl = EXPLORER_URLS[provider.chainId]

  const blockie = useMemo(() => makeBlockie(address), [address])

  const start = address.substring(0, VISIBLE_START + 2)
  const end = address.substring(42 - VISIBLE_END, 42)
  const displayAddress = `${start}...${end}`

  return (
    <Box roundedRight className={cn(className, classes.container)}>
      <div className={classes.address}>{displayAddress}</div>
      <Box rounded>
        <div className={classes.blockies}>
          <img src={blockie} alt={address} />
        </div>
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
