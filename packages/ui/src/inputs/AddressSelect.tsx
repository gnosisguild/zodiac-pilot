import type { HexAddress } from '@zodiac/schema'
import { Select, type SelectProps } from './Select'

type Option = {
  label: HexAddress
  value: HexAddress
}

export type AddressSelectProps<
  Creatable extends boolean,
  Multi extends boolean,
> = Omit<
  SelectProps<Option, Creatable, Multi>,
  'options' | 'value' | 'defaultValue'
> & {
  value?: HexAddress
  defaultValue?: HexAddress
  options: HexAddress[]
}

export function AddressSelect<
  Creatable extends boolean = false,
  Multi extends boolean = false,
>({
  value,
  defaultValue,
  options,
  ...props
}: AddressSelectProps<Creatable, Multi>) {
  return (
    <Select
      {...props}
      options={options.map((option) => ({ label: option, value: option }))}
      isValidNewOption={(option) => validateAddress(option) != null}
      value={value == null ? undefined : { label: value, value }}
      defaultValue={
        defaultValue == null
          ? undefined
          : { label: defaultValue, value: defaultValue }
      }
    ></Select>
  )
}
