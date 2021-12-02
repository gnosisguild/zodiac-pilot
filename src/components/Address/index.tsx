import cls from 'classnames'
import copy from 'copy-to-clipboard'
import React from 'react'
import Blockies from 'react-blockies'
import { RiExternalLinkLine, RiFileCopyLine } from 'react-icons/ri'

import { useWalletConnectProvider } from '../../WalletConnectProvider'
import Box from '../Box'

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

  const start = address.substring(0, VISIBLE_START + 2)
  const end = address.substring(42 - VISIBLE_END, 42)
  const displayAddress = `${start}...${end}`

  return (
    <div className={cls(className, classes.container)} title={address}>
      <Box rounded>
        <div className={classes.blockies}>
          <Blockies seed={address} size={8} scale={3} />
        </div>
      </Box>
      <div className={classes.address}>{displayAddress}</div>
      {copyToClipboard && (
        <button
          className={classes.copy}
          onClick={() => {
            copy(address)
          }}
        >
          <RiFileCopyLine />
        </button>
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
    </div>
  )
}

export default Address
