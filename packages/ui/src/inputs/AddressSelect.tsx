import {
  validateAddress,
  type HexAddress,
  type PrefixedAddress,
} from '@zodiac/schema'
import { unprefixAddress } from 'ser-kit'
import { Address } from '../addresses'
import { Select, type SelectProps } from './Select'

type Option = {
  label: HexAddress
  value: HexAddress
}

export type AddressSelectProps<Creatable extends boolean> = Omit<
  SelectProps<Option, Creatable>,
  'options' | 'value' | 'defaultValue'
> & {
  value?: HexAddress | PrefixedAddress
  defaultValue?: HexAddress | PrefixedAddress
  options: HexAddress[]
}

export function AddressSelect<Creatable extends boolean>({
  value,
  defaultValue,
  options,
  allowCreate = false,
  children,
  ...props
}: AddressSelectProps<Creatable>) {
  const processedValue = value == null ? undefined : unprefixAddress(value)
  const processedDefaultValue =
    defaultValue == null ? undefined : unprefixAddress(defaultValue)

  return (
    <Select
      {...props}
      allowCreate={allowCreate}
      options={options.map((option) => ({ label: option, value: option }))}
      isValidNewOption={(value) => validateAddress(value) != null}
      value={
        processedValue == null
          ? undefined
          : { label: processedValue, value: processedValue }
      }
      defaultValue={
        processedDefaultValue == null
          ? undefined
          : { label: processedDefaultValue, value: processedDefaultValue }
      }
    >
      {(props) => (
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 flex-shrink-0">
            <Address>{props.data.value}</Address>
          </div>

          {children != null && children(props)}
        </div>
      )}
    </Select>
  )
}
