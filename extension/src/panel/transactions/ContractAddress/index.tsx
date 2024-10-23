import { EXPLORER_URL } from '@/chains'
import { BlockLink, Box, Flex, IconButton, RawAddress } from '@/components'
import copy from 'copy-to-clipboard'
import makeBlockie from 'ethereum-blockies-base64'
import { getAddress } from 'ethers'
import React, { useMemo } from 'react'
import { RiExternalLinkLine, RiFileCopyLine } from 'react-icons/ri'
import { ChainId } from 'ser-kit'
import { ContractInfo } from '../../utils/abi'
import classes from './style.module.css'

interface Props {
  chainId: ChainId
  address: string
  contractInfo?: ContractInfo
  explorerLink?: boolean
  copyToClipboard?: boolean
  className?: string
}

const VISIBLE_START = 4
const VISIBLE_END = 4

const ContractAddress: React.FC<Props> = ({
  chainId,
  address,
  contractInfo,
  explorerLink,
  copyToClipboard,
  className,
}) => {
  const explorerUrl = EXPLORER_URL[chainId]

  const blockie = useMemo(() => address && makeBlockie(address), [address])

  const checksumAddress = address && getAddress(address)
  const start = checksumAddress.substring(0, VISIBLE_START + 2)
  const end = checksumAddress.substring(42 - VISIBLE_END, 42)
  const displayAddress = `${start}...${end}`

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

      {contractInfo?.name && (
        <div className={classes.contractName}>{contractInfo?.name}</div>
      )}

      <Flex gap={1} alignItems="center" className={classes.addressContainer}>
        <RawAddress>{displayAddress}</RawAddress>

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
