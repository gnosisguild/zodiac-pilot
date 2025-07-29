import { PropsWithChildren } from 'react'

export const Card = ({
  children,
  title,
}: PropsWithChildren<{ title?: string | null }>) => (
  <section className="flex flex-col gap-4 rounded border p-4 dark:border-zinc-700">
    {title && <h2 className="font-semibold">{title}</h2>}
    {children}
  </section>
)
