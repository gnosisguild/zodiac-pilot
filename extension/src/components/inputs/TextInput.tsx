import type { ComponentPropsWithoutRef } from 'react'
import { type ComposableInputProps, Input } from './Input'

type TextInputProps = Omit<
  ComponentPropsWithoutRef<'input'>,
  'id' | 'type' | 'className'
> &
  ComposableInputProps

export const TextInput = ({
  label,
  description,
  error,

  ...props
}: TextInputProps) => (
  <Input label={label} description={description} error={error}>
    {({ inputId, descriptionId }) => (
      <input
        {...props}
        type="text"
        id={inputId}
        aria-describedby={descriptionId}
        aria-errormessage={error ?? undefined}
        className="w-full border-none bg-transparent px-4 py-2 text-sm outline-none"
      />
    )}
  </Input>
)
