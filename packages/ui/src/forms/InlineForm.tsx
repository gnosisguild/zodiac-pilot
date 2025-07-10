import { useRef, type ComponentPropsWithRef } from 'react'
import { Form } from 'react-router'
import { AllowSubmit, type AllowSubmitChildren } from './AllowSubmit'
import { FormContext, type Context } from './FormContext'

type InlineFormProps = Omit<ComponentPropsWithRef<typeof Form>, 'children'> & {
  context?: Context
  intent?: string
  children?: AllowSubmitChildren
}

export const InlineForm = ({
  children,
  method = 'post',
  context = {},
  intent,

  ...props
}: InlineFormProps) => {
  const formRef = useRef(null)

  return (
    <Form method={method} ref={formRef} {...props}>
      <FormContext context={context} />

      {intent != null && <input type="hidden" name="intent" value={intent} />}

      <AllowSubmit formRef={formRef} method={method}>
        {children}
      </AllowSubmit>
    </Form>
  )
}
