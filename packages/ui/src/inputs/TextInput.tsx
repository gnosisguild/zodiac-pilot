import type { ComponentPropsWithoutRef } from 'react'
import { BareInput } from './BareInput'
import { type ComposableInputProps, Input } from './Input'
import { InputLayout, type InputLayoutProps } from './InputLayout'

type TextInputProps = Omit<
  ComponentPropsWithoutRef<'input'>,
  'id' | 'type' | 'className'
> &
  ComposableInputProps &
  InputLayoutProps

export const TextInput = ({
  label,
  description,
  error,
  disabled,
  after,
  before,

  ...props
}: TextInputProps) => (
  <Input label={label} description={description} error={error}>
    {({ inputId, descriptionId }) => (
      <InputLayout disabled={disabled} before={before} after={after}>
        <BareInput
          {...props}
          type="text"
          id={inputId}
          disabled={disabled}
          aria-describedby={descriptionId}
          aria-errormessage={error ?? undefined}
        />
      </InputLayout>
    )}
  </Input>
)
