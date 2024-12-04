import { ReactNode, useId } from 'react'
import { Label } from './Label'

type RenderProps = {
  inputId: string
  descriptionId: string
}

type InputProps = {
  label: string
  description?: string
  error?: string | null
  header?: ReactNode
  children: (props: RenderProps) => ReactNode
}

export const Input = ({ children, label, description, error }: InputProps) => {
  const inputId = useId()
  const descriptionId = useId()

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1">
        <Label htmlFor={inputId}>{label}</Label>

        {description && (
          <span className="opacity-70" id={descriptionId}>
            ({description})
          </span>
        )}
      </div>

      <div className="rounded-md border border-zinc-300 bg-zinc-100 shadow-sm transition-all dark:border-zinc-600 dark:bg-zinc-800 dark:text-white dark:hover:border-zinc-500">
        {children({ inputId, descriptionId })}
      </div>

      {error && <div className="text-sm font-bold text-red-600">{error}</div>}
    </div>
  )
}
