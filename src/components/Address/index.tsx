import cls from 'classnames'
import copy from 'copy-to-clipboard'
import React from 'react'
import Blockies from 'react-blockies'
import { RiExternalLinkLine, RiFileCopyLine } from 'react-icons/ri'

import Box from '../Box'

import classes from './style.module.css'

interface Props {
  address: string
  network?: number
  explorerLink?: boolean
  copyToClipboard?: boolean
  className?: string
}

const VISIBLE_START = 4
const VISIBLE_END = 4

const Address: React.FC<Props> = ({
  address,
  network = 4,
  explorerLink,
  copyToClipboard,
  className,
}) => {
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
          href={`https://rinkeby.etherscan.io/search?q=${address}`}
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
