import type { ComponentPropsWithoutRef } from 'react'
import { BareInput, type TextAlign } from './BareInput'
import { type ComposableInputProps, Input } from './Input'
import { InputLayout, type InputLayoutProps } from './InputLayout'

type TextInputProps = Omit<
  ComponentPropsWithoutRef<'input'>,
  'id' | 'type' | 'className' | 'value' | 'defaultValue'
> &
  ComposableInputProps &
  InputLayoutProps & {
    value?: string
    defaultValue?: string
    textAlign?: TextAlign
  }

export const TextInput = ({
  label,
  description,
  error,
  disabled,
  after,
  before,
  hideLabel,
  required = false,

  ...props
}: TextInputProps) => (
  <Input
    hideLabel={hideLabel}
    label={label}
    description={description}
    error={error}
    required={required}
  >
    {({ inputId, descriptionId }) => (
      <InputLayout disabled={disabled} before={before} after={after}>
        <BareInput
          {...props}
          required={required}
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
