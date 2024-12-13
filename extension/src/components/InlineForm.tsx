import type { ComponentPropsWithRef } from 'react'
import { Form } from 'react-router'

type InlineFormProps = ComponentPropsWithRef<typeof Form> & {
  context?: Record<string, string>
}

export const InlineForm = ({
  children,
  method = 'post',
  context = {},

  ...props
}: InlineFormProps) => {
  return (
    <Form method={method} {...props}>
      {Object.entries(context).map(([key, value]) => (
        <input type="hidden" key={key} name={key} value={value} />
      ))}

      {children}
    </Form>
  )
}
