import { PropsWithChildren, useId } from 'react'

type AlertProps = PropsWithChildren<{
  title?: string
}>

export const Alert = ({ children, title }: AlertProps) => {
  const titleId = useId()
  const descriptionId = useId()

  return (
    <div
      role="alert"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className="flex flex-col gap-2 rounded border border-yellow-600 bg-yellow-900 px-4 py-2"
    >
      {title && (
        <h4 id={titleId} className="font-bold">
          {title}
        </h4>
      )}

      {children && (
        <div id={descriptionId} className="text-sm">
          {children}
        </div>
      )}
    </div>
  )
}
