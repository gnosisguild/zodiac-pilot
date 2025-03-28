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

  ...props
}: EmailInputProps) => (
  <Input
    hideLabel={hideLabel}
    label={label}
    description={description}
    error={error}
  >
    {({ inputId, descriptionId }) => (
      <InputLayout disabled={disabled} before={before} after={after}>
        <BareInput
          {...props}
          type="email"
          id={inputId}
          disabled={disabled}
          aria-describedby={descriptionId}
          aria-errormessage={error ?? undefined}
        />
      </InputLayout>
    )}
  </Input>
)
