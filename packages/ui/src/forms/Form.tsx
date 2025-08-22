import { useRef, type ComponentProps } from 'react'
import { Form as BaseForm, useFormAction } from 'react-router'
import { AllowSubmit, type AllowSubmitChildren } from './AllowSubmit'
import { FormContext, type Context } from './FormContext'
import { FormLayout } from './FormLayout'

type FormProps = Omit<
  ComponentProps<typeof BaseForm>,
  'className' | 'children'
> & {
  intent?: string
  context?: Context
  children?: AllowSubmitChildren
}

export const Form = ({
  method = 'POST',
  children,
  context = {},
  intent,
  action,
  ...props
}: FormProps) => {
  const formRef = useRef(null)
  const defaultAction = useFormAction()

  return (
    <BaseForm {...props} ref={formRef} method={method} action={action}>
      <FormLayout>
        {intent && <input type="hidden" name="intent" value={intent} />}

        <FormContext context={context} />

        <AllowSubmit
          method={method}
          formRef={formRef}
          action={action || defaultAction}
        >
          {children}
        </AllowSubmit>
      </FormLayout>
    </BaseForm>
  )
}

Form.Actions = FormLayout.Actions
Form.Section = FormLayout.Section
