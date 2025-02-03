import { ZERO_ADDRESS } from '@zodiac/chains'
import type { HexAddress } from '@zodiac/schema'
import { Blockie, Select, type SelectProps } from '@zodiac/ui'
import type { PropsWithChildren } from 'react'
import { getAddress } from 'viem'

export const NO_MODULE_OPTION = { value: ZERO_ADDRESS, label: '' }

export interface Option {
  value: HexAddress
  label: string
}

interface Props<Option = unknown, Multi extends boolean = boolean>
  extends SelectProps<Option, false, Multi> {
  avatarAddress: HexAddress
}

export function ModSelect<Multi extends boolean = boolean>({
  avatarAddress,
  ...props
}: Props<Option, Multi>) {
  return (
    <Select
      {...props}
      noOptionsMessage={() => 'No modules are enabled on this Safe'}
    >
      {({ data: { value, label } }) => {
        if (!value)
          return (
            <Value label="No Mod — Direct execution" address={avatarAddress}>
              Transactions submitted directly to the Safe
            </Value>
          )

        const checksumAddress = getAddress(value)
        return (
          <Value address={value} label={label}>
            {checksumAddress}
          </Value>
        )
      }}
    </Select>
  )
}

type ValueProps = PropsWithChildren<{
  label: string
  address: HexAddress
}>

const Value = ({ label, address, children }: ValueProps) => (
  <div className="flex items-center gap-4">
    <Blockie address={address} className="size-5 shrink-0" />

    <div className="flex items-center gap-2 overflow-hidden">
      <span className="whitespace-nowrap font-semibold">{label}</span>
      <code
        aria-hidden
        className="overflow-hidden text-ellipsis whitespace-nowrap font-mono opacity-75"
      >
        {children}
      </code>
    </div>
  </div>
)
