import { createContext, useContext, type ReactNode } from 'react'
import {
  Labeled,
  type ComposableLabeledProps,
  type LabeledRenderProps,
} from './Labeled'

type InputContextOptions = {
  clearLabel?: string
  dropdownLabel?: string
}

const InputContext = createContext<InputContextOptions>({})

type InputProps = ComposableLabeledProps & {
  required: boolean
  error?: string | null
  children: (props: LabeledRenderProps) => ReactNode
} & InputContextOptions

export type ComposableInputProps = Omit<InputProps, 'children' | 'required'>

export const Input = ({
  children,
  label,
  description,
  error,
  clearLabel,
  hideLabel,
  dropdownLabel,
  required,
}: InputProps) => (
  <Labeled
    hideLabel={hideLabel}
    label={label}
    description={description}
    required={required}
  >
    {({ inputId, descriptionId }) => (
      <>
        <InputContext value={{ clearLabel, dropdownLabel }}>
          {children({ inputId, descriptionId })}
        </InputContext>

        {error && <div className="text-sm font-bold text-red-600">{error}</div>}
      </>
    )}
  </Labeled>
)

export const useClearLabel = () => {
  const { clearLabel } = useContext(InputContext)

  return clearLabel
}

export const useDropdownLabel = () => {
  const { dropdownLabel } = useContext(InputContext)

  return dropdownLabel
}
