import { getChainId, ZERO_ADDRESS } from '@zodiac/chains'
import { PrefixedAddress } from '@zodiac/schema'
import classNames from 'classnames'
import { CircleDollarSign } from 'lucide-react'
import { useState, type PropsWithChildren } from 'react'
import { href } from 'react-router'
import { unprefixAddress } from 'ser-kit'

type TokenByContractId = {
  contractAddress: PrefixedAddress
}

type TokenByLogoUrl = {
  logoUrl: string | null
}

type TokenProps = PropsWithChildren<TokenByContractId | TokenByLogoUrl>

export const Token = ({ children, ...props }: TokenProps) => {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className="flex items-center gap-2 overflow-hidden">
      <div className="pointer-events-none relative flex size-4 items-center justify-center">
        {'contractAddress' in props && (
          <img
            src={getIconUrl(props.contractAddress)}
            alt=""
            className={classNames(
              'absolute inset-0 z-10 size-4 overflow-hidden rounded-full',
              loaded && 'bg-zinc-300',
            )}
            onLoad={() => setLoaded(true)}
          />
        )}

        {'logoUrl' in props && props.logoUrl != null && (
          <img
            src={props.logoUrl}
            alt=""
            className="absolute inset-0 z-10 size-4 overflow-hidden rounded-full"
          />
        )}

        <div className="flex size-4 items-center justify-center">
          <CircleDollarSign size={16} className="opacity-50" />
        </div>
      </div>

      <span className="overflow-hidden text-ellipsis whitespace-nowrap text-sm">
        {children}
      </span>
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
