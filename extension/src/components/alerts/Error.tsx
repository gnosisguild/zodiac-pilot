import { PropsWithChildren, useId } from 'react'

type ErrorProps = PropsWithChildren<{
  title?: string
}>

export const Error = ({ children, title }: ErrorProps) => {
  const titleId = useId()
  const descriptionId = useId()

  return (
    <div
      role="alert"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className="flex flex-col gap-2 text-balance rounded bg-red-800 px-4 py-2 text-white"
    >
      {title && (
        <h4 id={titleId} className="text-sm font-bold text-white">
          {title}
        </h4>
      )}

      {children && (
        <div id={descriptionId} className="text-sm text-red-200">
          {children}
        </div>
      )}
    </div>
  )
}
