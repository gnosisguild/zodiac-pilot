import type { PropsWithChildren } from 'react'

export const Section = ({ children }: PropsWithChildren) => (
  <div className="flex flex-col gap-4">{children}</div>
)

const Actions = ({ children }: PropsWithChildren) => (
  <div className="flex gap-2">{children}</div>
)

Section.Actions = Actions
