import { PropsWithChildren, useId } from 'react'

export const Alert = ({ children }: PropsWithChildren) => {
  const id = useId()

  return (
    <div
      role="alert"
      aria-labelledby={id}
      className="rounded border border-yellow-600 bg-yellow-900 px-4 py-2"
    >
      <h4 id={id}>{children}</h4>
    </div>
  )
}
