import cn from 'classnames'
import copy from 'copy-to-clipboard'
import makeBlockie from 'ethereum-blockies-base64'
import React, { useEffect, useMemo, useState } from 'react'
import { RiExternalLinkLine, RiFileCopyLine } from 'react-icons/ri'

import { Box, Flex, IconButton } from '../../../components'
import { useConnection } from '../../../settings'

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

const EXPLORER_API_URLS: Record<string, string | undefined> = {
  '1': 'https://api.etherscan.io/api',
  '4': 'https://api.rinkeby.etherscan.io/api',
  '100': 'https://blockscout.com/xdai/mainnet/api',
  '73799': 'https://volta-explorer.energyweb.org/api',
  '246': 'https://explorer.energyweb.org/api',
  '137': 'https://api.polygonscan.com/api',
  '56': 'https://api.bscscan.com/api',
  '42161': 'https://api.arbiscan.io/api',
}

const EXPLORER_API_KEYS: Record<string, string | undefined> = {
  '1': process.env.ETHERSCAN_API_KEY,
  '4': process.env.ETHERSCAN_API_KEY,
  '100': '',
}

const ContractAddress: React.FC<Props> = ({
  address,
  explorerLink,
  copyToClipboard,
  className,
}) => {
  const { provider } = useConnection()
  const [contractName, setContractName] = useState('')
  const explorerUrl = EXPLORER_URLS[provider.chainId]

  const blockie = useMemo(() => address && makeBlockie(address), [address])

  const start = address.substring(0, VISIBLE_START + 2)
  const end = address.substring(42 - VISIBLE_END, 42)
  const displayAddress = `${start}...${end}`

  useEffect(() => {
    let canceled = false
    const explorerApiUrl = EXPLORER_API_URLS[provider.chainId]
    const apiKey = EXPLORER_API_KEYS[provider.chainId] || ''

    fetch(
      `${explorerApiUrl}?module=contract&action=getsourcecode&address=${address}&apikey=${apiKey}`
    )
      .then((res) => res.json())
      .then((json) => {
        if (!canceled) {
          setContractName(json.result[0]?.ContractName || '')
        }
      })

    return () => {
      setContractName('')
      canceled = true
    }
  }, [provider.chainId, address])

  return (
    <Flex gap={1} className={cn(className, classes.container)}>
      <div className={classes.blockies}>
        <img src={blockie} alt={address} />
      </div>

      {contractName && (
        <div className={classes.contractName}>{contractName}</div>
      )}
      <div className={classes.address}>{displayAddress}</div>

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
    </Flex>
  )
}

export default ContractAddress
