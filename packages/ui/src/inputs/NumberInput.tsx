import type { ComponentPropsWithoutRef } from 'react'
import { BareInput } from './BareInput'
import { type ComposableInputProps, Input } from './Input'
import { InputLayout, type InputLayoutProps } from './InputLayout'

export type NumberInputProps = Omit<
  ComponentPropsWithoutRef<'input'>,
  'id' | 'type' | 'className'
> &
  ComposableInputProps &
  InputLayoutProps

export const NumberInput = ({
  label,
  description,
  error,
  disabled,
  after,
  before,
  placeholder = '0',

  ...props
}: NumberInputProps) => (
  <Input label={label} description={description} error={error}>
    {({ inputId, descriptionId }) => (
      <InputLayout disabled={disabled} before={before} after={after}>
        <BareInput
          {...props}
          type="number"
          id={inputId}
          disabled={disabled}
          aria-describedby={descriptionId}
          aria-errormessage={error ?? undefined}
          placeholder={placeholder}
        />
      </InputLayout>
    )}
  </Input>
)
