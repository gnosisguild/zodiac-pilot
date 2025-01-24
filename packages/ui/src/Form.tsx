import type { ComponentProps, PropsWithChildren } from 'react'
import { Form as BaseForm } from 'react-router'

export const Form = ({
  method = 'POST',
  ...props
}: Omit<ComponentProps<typeof BaseForm>, 'className'>) => (
  <BaseForm {...props} method={method} className="flex flex-col gap-4" />
)

const Actions = ({ children }: PropsWithChildren) => (
  <div className="mt-8 flex items-center justify-between gap-8">{children}</div>
)

Form.Actions = Actions
