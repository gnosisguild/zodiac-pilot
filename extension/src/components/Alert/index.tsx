import { PropsWithChildren, ReactNode, useId } from 'react'

type AlertProps = PropsWithChildren<{
  actions?: ReactNode
}>

export const Alert = ({ children, actions }: AlertProps) => {
  const id = useId()

  return (
    <div
      role="alert"
      aria-labelledby={id}
      className="flex justify-between rounded border border-yellow-600 bg-yellow-900 px-4 py-2"
    >
      <h4 id={id}>{children}</h4>

      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  )
}
