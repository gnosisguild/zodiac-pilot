import { ZERO_ADDRESS } from '@zodiac/chains'
import type { HexAddress } from '@zodiac/schema'
import { Blockie, Select, type SelectProps } from '@zodiac/ui'
import { getAddress } from 'ethers'
import type { PropsWithChildren } from 'react'

export const NO_MODULE_OPTION = { value: ZERO_ADDRESS, label: '' }

export interface Option {
  value: HexAddress
  label: string
}

interface Props<Option = unknown, Multi extends boolean = boolean>
  extends SelectProps<false, Option, Multi> {
  avatarAddress: string
}

export function ModSelect<Multi extends boolean = boolean>({
  avatarAddress,
  ...props
}: Props<Option, Multi>) {
  const ModuleOptionLabel = (option: Option) => {
    if (!option.value)
      return (
        <Value label="No Mod — Direct execution" address={avatarAddress}>
          Transactions submitted directly to the Safe
        </Value>
      )

    const checksumAddress = getAddress(option.value)
    return (
      <Value address={option.value} label={option.label}>
        {checksumAddress}
      </Value>
    )
  }

  return (
    <Select
      {...props}
      formatOptionLabel={ModuleOptionLabel}
      noOptionsMessage={() => 'No modules are enabled on this Safe'}
    />
  )
}

type ValueProps = PropsWithChildren<{
  label: string
  address: string
}>

const Value = ({ label, address, children }: ValueProps) => (
  <div className="flex items-center gap-4 py-2">
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
