import type { ComponentPropsWithoutRef } from 'react'
import { BareInput, type TextAlign } from './BareInput'
import { type ComposableInputProps, Input } from './Input'
import { InputLayout, type InputLayoutProps } from './InputLayout'

type EmailInputProps = Omit<
  ComponentPropsWithoutRef<'input'>,
  'id' | 'type' | 'className'
> &
  ComposableInputProps &
  InputLayoutProps & {
    textAlign?: TextAlign
  }

export const EmailInput = ({
  label,
  description,
  error,
  disabled,
  after,
  before,
  hideLabel,
  required = false,

  ...props
}: EmailInputProps) => (
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
          type="email"
          required={required}
          id={inputId}
          disabled={disabled}
          aria-describedby={descriptionId}
          aria-errormessage={error ?? undefined}
        />
      </InputLayout>
    )}
  </Input>
)
