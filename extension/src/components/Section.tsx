import { PropsWithChildren, useId } from 'react'

type SectionProps = PropsWithChildren<{ title?: string }>

export const Section = ({ title, children }: SectionProps) => {
  const titleId = useId()

  return (
    <section aria-labelledby={titleId}>
      {title && (
        <h2 className="mb-2 text-sm font-semibold text-gray-50" id={titleId}>
          {title}
        </h2>
      )}

      {children}
    </section>
  )
}
