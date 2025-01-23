import { type PropsWithChildren, useId } from 'react'

type SectionProps = PropsWithChildren<{
  title?: string
  description?: string
}>

export const Section = ({ title, description, children }: SectionProps) => {
  const titleId = useId()
  const descriptionId = useId()

  return (
    <div className="flex flex-col gap-4">
      {title && (
        <h2 id={titleId} className="text-lg font-semibold">
          {title}
        </h2>
      )}

      <section
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="flex flex-col gap-6 rounded-sm border border-gray-200 p-4"
      >
        {description && (
          <p id={descriptionId} className="text-gray-500">
            {description}
          </p>
        )}

        {children}
      </section>
    </div>
  )
}
