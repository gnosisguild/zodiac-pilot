import { PropsWithChildren, useId } from 'react'

type SectionProps = PropsWithChildren<{
  title: string
  description?: string
}>

export const Section = ({ title, description, children }: SectionProps) => {
  const titleId = useId()
  const descriptionId = useId()

  return (
    <section
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className="flex flex-col gap-6"
    >
      <h2 id={titleId} className="text-xl font-semibold">
        {title}
      </h2>

      {children}
    </section>
  )
}
