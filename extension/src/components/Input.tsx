import { ReactNode, useId } from 'react'

type RenderProps = {
  inputId: string
  descriptionId: string
}

type InputProps = {
  label: string
  description?: string
  children: (props: RenderProps) => ReactNode
}

export const Input = ({ children, label, description }: InputProps) => {
  const inputId = useId()
  const descriptionId = useId()

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId}>{label}</label>

      {children({ inputId, descriptionId })}

      {description && (
        <span className="opacity-70" id={descriptionId}>
          {description}
        </span>
      )}
    </div>
  )
}
