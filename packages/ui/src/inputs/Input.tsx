import { createContext, type ReactNode, useContext } from 'react'
import { Labeled, type LabeledRenderProps } from './Labeled'

type InputContextOptions = {
  clearLabel?: string
  dropdownLabel?: string
}

const InputContext = createContext<InputContextOptions>({})

type InputProps = {
  label: string
  description?: string
  error?: string | null
  before?: ReactNode
  after?: ReactNode
  children: (props: LabeledRenderProps) => ReactNode
} & InputContextOptions

export type ComposableInputProps = Omit<
  InputProps,
  'children' | 'after' | 'before'
>

export const Input = ({
  children,
  before,
  after,
  label,
  description,
  error,
  clearLabel,
  dropdownLabel,
}: InputProps) => (
  <Labeled label={label} description={description}>
    {({ inputId, descriptionId }) => (
      <>
        <InputContext value={{ clearLabel, dropdownLabel }}>
          <div className="flex items-center rounded-md border border-zinc-300 bg-zinc-100 shadow-sm transition-all dark:border-zinc-600 dark:bg-zinc-800 dark:text-white dark:hover:border-zinc-500">
            {before}

            <div className="flex-1">{children({ inputId, descriptionId })}</div>

            {after}
          </div>
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
