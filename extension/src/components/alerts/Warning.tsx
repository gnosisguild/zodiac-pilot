import { PropsWithChildren, useId } from 'react'

type WarningProps = PropsWithChildren<{
  title?: string
}>

export const Warning = ({ children, title }: WarningProps) => {
  const titleId = useId()
  const descriptionId = useId()

  return (
    <div
      role="alert"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className="flex flex-col gap-2 rounded bg-yellow-800 px-4 py-2 text-white shadow-md"
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
