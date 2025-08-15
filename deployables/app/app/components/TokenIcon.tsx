import { getChainId, ZERO_ADDRESS } from '@zodiac/chains'
import { PrefixedAddress } from '@zodiac/schema'
import classNames from 'classnames'
import { CircleDollarSign } from 'lucide-react'
import { useState } from 'react'
import { href } from 'react-router'
import { unprefixAddress } from 'ser-kit'

type TokenByContractId = {
  contractAddress: PrefixedAddress
}

type TokenByLogoUrl = {
  logoUrl: string | null
}

export type TokenIconProps = TokenByContractId | TokenByLogoUrl

export const TokenIcon = (props: TokenIconProps) => {
  const [loaded, setLoaded] = useState(false)
  const [loadFailed, setLoadFailed] = useState(false)

  return (
    <div className="pointer-events-none relative flex size-4 items-center justify-center">
      {'contractAddress' in props && (
        <img
          src={getIconUrl(props.contractAddress)}
          alt=""
          className={classNames(
            'absolute inset-0 z-10 size-4 overflow-hidden rounded-full',
            loaded && 'bg-zinc-300',
            loadFailed && 'hidden',
          )}
          onLoad={() => setLoaded(true)}
          onError={() => setLoadFailed(true)}
        />
      )}

      {'logoUrl' in props && props.logoUrl != null && (
        <img
          src={props.logoUrl}
          alt=""
          className={classNames(
            'absolute inset-0 z-10 size-4 overflow-hidden rounded-full',
            loadFailed && 'hidden',
          )}
          onError={() => setLoadFailed(true)}
        />
      )}

      <div className="flex size-4 items-center justify-center">
        <CircleDollarSign size={16} className="opacity-50" />
      </div>
    </div>
  )
}

const getIconUrl = (prefixedAddress: PrefixedAddress) => {
  const address = unprefixAddress(prefixedAddress)

  if (address === ZERO_ADDRESS) {
    return href('/system/chain-icon/:chainId', {
      chainId: getChainId(prefixedAddress).toString(),
    })
  }

  return href('/system/token-icon/:prefixedAddress', {
    prefixedAddress,
  })
}
