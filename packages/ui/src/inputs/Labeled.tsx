import { useId, type ReactNode } from 'react'
import { Label } from './Label'

export type LabeledRenderProps = {
  inputId: string
  descriptionId: string
}

export type ComposableLabeledProps = {
  label: string
  hideLabel?: boolean
  description?: string | null
}

type LabeledProps = ComposableLabeledProps & {
  children: ReactNode | ((props: LabeledRenderProps) => ReactNode)
}

export const Labeled = ({
  children,
  hideLabel = false,
  label,
  description,
}: LabeledProps) => {
  const inputId = useId()
  const descriptionId = useId()

  if (hideLabel) {
    return (
      <>
        <label htmlFor={inputId} className="sr-only">
          {label}
        </label>

        {description && (
          <span id={descriptionId} className="sr-only">
            {description}
          </span>
        )}

        {typeof children === 'function'
          ? children({ inputId, descriptionId })
          : children}
      </>
    )
  }

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
