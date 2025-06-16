import type { ComponentPropsWithRef } from 'react'
import { Form } from 'react-router'

export type InlineFormContext = Record<
  string,
  string | number | null | undefined
>

type InlineFormProps = ComponentPropsWithRef<typeof Form> & {
  context?: InlineFormContext
  intent?: string
}

export const InlineForm = ({
  children,
  method = 'post',
  context = {},
  intent,

  ...props
}: InlineFormProps) => {
  return (
    <Form method={method} {...props}>
      {Object.entries(context).map(
        ([key, value]) =>
          value != null && (
            <input type="hidden" key={key} name={key} value={value} />
          ),
      )}

      {intent != null && <input type="hidden" name="intent" value={intent} />}

      {children}
    </Form>
  )
}
