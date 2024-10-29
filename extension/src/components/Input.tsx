import { ReactNode, useId } from 'react'

type InputProps = {
  label: string
  children: (inputId: string) => ReactNode
}

export const Input = ({ children, label }: InputProps) => {
  const id = useId()

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id}>{label}</label>

      {children(id)}
    </div>
  )
}
