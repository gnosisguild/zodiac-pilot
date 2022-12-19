import copy from 'copy-to-clipboard'
import makeBlockie from 'ethereum-blockies-base64'
import { getAddress } from 'ethers/lib/utils'
import React, { useEffect, useMemo, useState } from 'react'
import { RiExternalLinkLine, RiFileCopyLine } from 'react-icons/ri'

import { BlockLink, Box, Flex, IconButton } from '../../../components'
import {
  EXPLORER_API_KEY,
  EXPLORER_API_URL,
  EXPLORER_URL,
} from '../../../networks'
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

const ContractAddress: React.FC<Props> = ({
  address,
  explorerLink,
  copyToClipboard,
  className,
}) => {
  const {
    connection: { chainId },
  } = useConnection()
  const [contractName, setContractName] = useState('')
  const explorerUrl = EXPLORER_URL[chainId]

  const blockie = useMemo(() => address && makeBlockie(address), [address])

  const checksumAddress = address && getAddress(address)
  const start = checksumAddress.substring(0, VISIBLE_START + 2)
  const end = checksumAddress.substring(42 - VISIBLE_END, 42)
  const displayAddress = `${start}...${end}`

  useEffect(() => {
    let canceled = false
    const explorerApiUrl = EXPLORER_API_URL[chainId]
    const apiKey = EXPLORER_API_KEY[chainId]

    memoizedFetchJson(
      `${explorerApiUrl}?module=contract&action=getsourcecode&address=${address}&apikey=${apiKey}`
    ).then((json) => {
      if (!canceled) {
        setContractName(json.result[0]?.ContractName || '')
      }
    })

    return () => {
      setContractName('')
      canceled = true
    }
  }, [chainId, address])

  return (
    <Flex
      gap={2}
      alignItems="center"
      justifyContent="start"
      className={className}
    >
      <Box p={1} rounded className={classes.blockies}>
        <img src={blockie} alt={address} />
      </Box>

      {contractName && (
        <div className={classes.contractName}>{contractName}</div>
      )}

      <Flex gap={1} alignItems="center" className={classes.addressContainer}>
        <code>{displayAddress}</code>

        {copyToClipboard && (
          <IconButton
            title="Copy to clipboard"
            onClick={() => {
              copy(address)
            }}
          >
            <RiFileCopyLine />
          </IconButton>
        )}
        {explorerLink && (
          <BlockLink
            href={`${explorerUrl}/search?q=${address}`}
            target="_blank"
            className={classes.link}
            title="Show in block explorer"
            rel="noreferrer"
          >
            <RiExternalLinkLine />
          </BlockLink>
        )}
      </Flex>
    </Flex>
  )
}

export default ContractAddress

const fetchCache = new Map<string, any>()
const memoizedFetchJson = async (url: string) => {
  if (fetchCache.has(url)) {
    return fetchCache.get(url)
  }
  const json = await fetch(url).then((res) => res.json())
  fetchCache.set(url, json)
  return json
}
