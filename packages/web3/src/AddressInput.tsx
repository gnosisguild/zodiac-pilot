import { ZERO_ADDRESS } from '@zodiac/chains'
import { addressSchema, type HexAddress } from '@zodiac/schema'
import { Input, InputLayout, type ComposableInputProps } from '@zodiac/ui'
import classNames from 'classnames'
import { useState, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import { getAddress } from 'viem'
import { Blockie } from './Blockie'

type AddressInputProps = Omit<
  ComponentPropsWithoutRef<'input'>,
  'id' | 'type' | 'className' | 'value' | 'defaultValue' | 'onChange'
> &
  Omit<ComposableInputProps, 'before' | 'after'> & {
    value?: HexAddress | null
    onChange?: (value: HexAddress | null) => void
    defaultValue?: HexAddress
    action?: ReactNode
  }

export const AddressInput = ({
  label,
  description,
  error,
  action,
  disabled,
  value,
  defaultValue,
  placeholder = ZERO_ADDRESS,
  hideLabel,
  onChange,
  required = false,
  ...props
}: AddressInputProps) => {
  const [blockieValue, setBlockieValue] = useState(
    defaultValue || value || ZERO_ADDRESS,
  )

  return (
    <Input
      label={label}
      description={description}
      error={error}
      hideLabel={hideLabel}
      required={required}
    >
      {({ inputId, descriptionId }) => (
        <InputLayout
          disabled={disabled}
          before={
            <Blockie address={blockieValue} className="ml-4 size-5 shrink-0" />
          }
          after={action && <div className="mr-2">{action}</div>}
        >
          <input
            {...props}
            type="text"
            pattern="0x\w{40}"
            id={inputId}
            required={required}
            disabled={disabled}
            value={value == null ? undefined : getAddress(value)}
            defaultValue={defaultValue}
            aria-describedby={descriptionId}
            aria-errormessage={error ?? undefined}
            placeholder={placeholder}
            onInvalid={(e) => {
              if (e.currentTarget.validity.patternMismatch) {
                e.currentTarget.setCustomValidity(
                  'Please use a 40 character hex address',
                )
              }
            }}
            onInput={(e) => e.currentTarget.setCustomValidity('')}
            onChange={(event) => {
              const value = event.target.value

              try {
                const address = addressSchema.parse(value)

                setBlockieValue(address)

                if (onChange != null) {
                  onChange(address)
                }
              } catch {
                setBlockieValue(ZERO_ADDRESS)

                if (onChange != null) {
                  onChange(null)
                }
              }
            }}
            className={classNames(
              'outline-hidden w-full border-none bg-transparent px-4 py-2 font-mono text-sm',
              disabled && 'cursor-not-allowed',
            )}
          />
        </InputLayout>
      )}
    </Input>
  )
}
