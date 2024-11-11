import { PropsWithChildren, useId } from 'react'

type SectionProps = PropsWithChildren<{ title?: string }>

export const Section = ({ title, children }: SectionProps) => {
  const titleId = useId()

  return (
    <section
      aria-labelledby={titleId}
      className="border-[3px] border-double border-zodiac-light-mustard border-opacity-30 bg-zodiac-light-mustard bg-opacity-10 p-3"
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
