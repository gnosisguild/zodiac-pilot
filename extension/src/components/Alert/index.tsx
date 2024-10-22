import { PropsWithChildren, useId } from 'react'

type AlertProps = PropsWithChildren<{
  title?: string
}>

export const Alert = ({ children, title }: AlertProps) => {
  const id = useId()

  return (
    <div
      role="alert"
      aria-labelledby={id}
      className="flex flex-col gap-2 rounded border border-yellow-600 bg-yellow-900 px-4 py-2"
    >
      {title && (
        <h4 id={id} className="font-bold">
          {title}
        </h4>
      )}

      {children && <div className="text-sm">{children}</div>}
    </div>
  )
}
