import { Token } from '@/components'
import { chainName, getChainId } from '@zodiac/chains'
import { PrefixedAddress } from '@zodiac/schema'
import { MultiSelect } from '@zodiac/ui'
import { ComponentProps } from 'react'
import { href } from 'react-router'
import { Tokens } from './getTokens'

type TokenSelectProps = Omit<
  ComponentProps<typeof MultiSelect<PrefixedAddress>>,
  'options' | 'children'
> & {
  tokens: Tokens
}

export const TokenSelect = ({ tokens, ...props }: TokenSelectProps) => (
  <MultiSelect
    {...props}
    options={Object.values(tokens).map((token) => ({
      label: token.symbol,
      value: token.address,
    }))}
  >
    {({ data: { value, label } }) => (
      <div className="flex items-center justify-between gap-2">
        <Token contractAddress={value}>{label}</Token>

        <span aria-hidden className="text-zinc-500 dark:text-zinc-300">
          <Token
            logoUrl={href('/system/chain-icon/:chainId', {
              chainId: `${getChainId(value)}`,
            })}
          >
            {chainName(getChainId(value))}
          </Token>
        </span>
      </div>
    )}
  </MultiSelect>
)
