import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { Blockie } from '../Blockie'
import { type ComposableInputProps, Input } from './Input'

type AddressInputProps = Omit<
  ComponentPropsWithoutRef<'input'>,
  'id' | 'type' | 'className' | 'value'
> &
  ComposableInputProps & {
    value?: string
    action?: ReactNode
  }

export const AddressInput = ({
  label,
  description,
  error,
  action,
  ...props
}: AddressInputProps) => (
  <Input
    label={label}
    description={description}
    error={error}
    after={action && <div className="mr-2">{action}</div>}
    before={
      <Blockie
        address={props.value || '0x0000000000000000000000000000000000000000'}
        className="ml-4 size-5 shrink-0"
      />
    }
  >
    {({ inputId, descriptionId }) => (
      <input
        {...props}
        id={inputId}
        aria-describedby={descriptionId}
        aria-errormessage={error ?? undefined}
        className="w-full border-none bg-transparent px-4 py-2 font-mono text-sm outline-none"
      />
    )}
  </Input>
)
