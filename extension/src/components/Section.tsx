import { PropsWithChildren, useId } from 'react'

type SectionProps = PropsWithChildren<{ title?: string }>

export const Section = ({ title, children }: SectionProps) => {
  const titleId = useId()

  return (
    <section
      aria-labelledby={titleId}
      className="rounded-md border border-white/30 bg-zinc-900 p-4"
    >
      {title && (
        <h2 className="mb-1" id={titleId}>
          {title}
        </h2>
      )}

      {children}
    </section>
  )
}
