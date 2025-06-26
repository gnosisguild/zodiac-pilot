import {
  validateAddress,
  type HexAddress,
  type PrefixedAddress,
} from '@zodiac/schema'
import { unprefixAddress } from 'ser-kit'
import { Address } from '../addresses'
import { Select, type SelectProps } from './Select'

type Option = {
  label: string
  value: HexAddress
}

type LabeledAddress = {
  label: string | null
  address: HexAddress
}

type Options = (HexAddress | LabeledAddress)[]

export type AddressSelectProps<Creatable extends boolean> = Omit<
  SelectProps<Option, Creatable>,
  'options' | 'value' | 'defaultValue'
> & {
  value?: HexAddress | PrefixedAddress
  defaultValue?: HexAddress | PrefixedAddress
  options: Options
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
      options={options.map((option) => {
        if (typeof option === 'string') {
          return { label: option, value: option }
        }

        return {
          label: option.label || 'Unnamed account',
          value: option.address,
        }
      })}
      isValidNewOption={(value) => validateAddress(value) != null}
      value={
        processedValue == null ? undefined : getValue(options, processedValue)
      }
      defaultValue={
        processedDefaultValue == null
          ? undefined
          : getValue(options, processedDefaultValue)
      }
    >
      {(props) => (
        <div className="flex w-full items-center justify-between gap-4">
          <div className="flex-1 flex-shrink-0 overflow-hidden">
            <Address
              label={
                props.data.value === props.data.label ||
                getValue(options, props.data.value) == null
                  ? undefined
                  : props.data.label
              }
            >
              {props.data.value}
            </Address>
          </div>

          <div aria-hidden id={props.selectProps.id}>
            {children != null && children(props)}
          </div>
        </div>
      )}
    </Select>
  )
}

const getValue = (options: Options, value: HexAddress) => {
  const existingValue = options.reduce<Option | undefined>(
    (finalValue, option) => {
      if (finalValue != null) {
        return finalValue
      }

      if (typeof option === 'string') {
        if (option === value) {
          return { label: value, value }
        }

        return finalValue
      }

      if (option.address === value) {
        return {
          label: option.label || 'Unnamed account',
          value: option.address,
        }
      }

      return finalValue
    },
    undefined,
  )

  if (existingValue != null) {
    return existingValue
  }

  return { label: value, value }
}
