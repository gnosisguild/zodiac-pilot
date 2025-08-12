import { Token } from '@/components'
import { Chain } from '@/routes-ui'
import { getChainId } from '@zodiac/chains'
import { PrefixedAddress } from '@zodiac/schema'
import { MultiSelect } from '@zodiac/ui'
import { ComponentProps } from 'react'
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
    {({ data: { value, label } }) => {
      const token = tokens[value]

      return (
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1">
            <Token logoUrl={token.logoURI} />
            {label}
          </span>

          <span aria-hidden className="text-zinc-300">
            <Chain chainId={getChainId(value)} />
          </span>
        </div>
      )
    }}
  </MultiSelect>
)
