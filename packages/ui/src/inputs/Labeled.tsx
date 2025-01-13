import { useId, type ReactNode } from 'react'
import { Label } from './Label'

export type LabeledRenderProps = {
  inputId: string
  descriptionId: string
}

type LabeledProps = {
  label: string
  description?: string
  children: ReactNode | ((props: LabeledRenderProps) => ReactNode)
}

export const Labeled = ({ children, label, description }: LabeledProps) => {
  const inputId = useId()
  const descriptionId = useId()

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1">
        <Label htmlFor={inputId}>{label}</Label>

        {description && (
          <span className="text-sm opacity-70">
            (<span id={descriptionId}>{description}</span>)
          </span>
        )}
      </div>

      {typeof children === 'function'
        ? children({ inputId, descriptionId })
        : children}
    </div>
  )
}
