import { Blockie, Circle, RawAddress, Select } from '@/components'
import { getAddress } from 'ethers'
import { PropsWithChildren } from 'react'
import { Props as SelectProps } from 'react-select'

export const NO_MODULE_OPTION = { value: '', label: '' }

export interface Option {
  value: string
  label: string
}

interface Props<Option = unknown, Multi extends boolean = boolean>
  extends SelectProps<Option, Multi> {
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
      label="Zodiac Mod"
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
  <div className="flex items-center gap-4 py-3">
    <Circle>
      <Blockie address={address} className="size-10" />
    </Circle>
    <div className="flex flex-col gap-1 overflow-hidden">
      <p className="pl-1 text-base">{label}</p>
      <RawAddress>{children}</RawAddress>
    </div>
  </div>
)
