import { createContext, type ReactNode, useContext, useId } from 'react'
import { Label } from './Label'

type InputContextOptions = {
  clearLabel?: string
  dropdownLabel?: string
}

const InputContext = createContext<InputContextOptions>({})

type RenderProps = {
  inputId: string
  descriptionId: string
}

type InputProps = {
  label: string
  description?: string
  error?: string | null
  before?: ReactNode
  after?: ReactNode
  children: (props: RenderProps) => ReactNode
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
}: InputProps) => {
  const inputId = useId()
  const descriptionId = useId()

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1">
        <Label htmlFor={inputId}>{label}</Label>

        {description && (
          <span className="text-sm opacity-70" id={descriptionId}>
            ({description})
          </span>
        )}
      </div>

      <InputContext value={{ clearLabel, dropdownLabel }}>
        <div className="flex items-center rounded-md border border-zinc-300 bg-zinc-100 shadow-sm transition-all dark:border-zinc-600 dark:bg-zinc-800 dark:text-white dark:hover:border-zinc-500">
          {before}

          <div className="flex-1">{children({ inputId, descriptionId })}</div>

          {after}
        </div>
      </InputContext>

      {error && <div className="text-sm font-bold text-red-600">{error}</div>}
    </div>
  )
}

export const useClearLabel = () => {
  const { clearLabel } = useContext(InputContext)

  return clearLabel
}

export const useDropdownLabel = () => {
  const { dropdownLabel } = useContext(InputContext)

  return dropdownLabel
}
