import { ZERO_ADDRESS } from '@zodiac/chains'
import type { HexAddress } from '@zodiac/schema'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { Blockie } from '../Blockie'
import { type ComposableInputProps, Input } from './Input'

type AddressInputProps = Omit<
  ComponentPropsWithoutRef<'input'>,
  'id' | 'type' | 'className' | 'value'
> &
  Omit<ComposableInputProps, 'before' | 'after'> & {
    value?: HexAddress | null
    action?: ReactNode
  }

export const AddressInput = ({
  label,
  description,
  error,
  action,
  disabled,
  value,
  placeholder = ZERO_ADDRESS,
  ...props
}: AddressInputProps) => (
  <Input
    label={label}
    description={description}
    error={error}
    disabled={disabled}
    after={action && <div className="mr-2">{action}</div>}
    before={
      <Blockie
        address={value || ZERO_ADDRESS}
        className="ml-4 size-5 shrink-0"
      />
    }
  >
    {({ inputId, descriptionId }) => (
      <input
        {...props}
        type="text"
        pattern="0x\w+"
        id={inputId}
        disabled={disabled}
        defaultValue={value ?? ''}
        aria-describedby={descriptionId}
        aria-errormessage={error ?? undefined}
        placeholder={placeholder}
        className="outline-hidden w-full border-none bg-transparent px-4 py-2 font-mono text-sm"
      />
    )}
  </Input>
)
