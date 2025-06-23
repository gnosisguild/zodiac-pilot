import { useCallback, useRef, type ComponentProps, type ReactNode } from 'react'
import { Form as BaseForm, useFormAction, useSubmit } from 'react-router'
import { FormLayout } from './FormLayout'

type RenderProps = {
  submit: () => void
}

type FormProps = Omit<
  ComponentProps<typeof BaseForm>,
  'className' | 'children'
> & {
  intent?: string
  context?: Record<string, string | number | boolean | null | undefined>
  children?: ReactNode | ((props: RenderProps) => ReactNode)
}

export const Form = ({
  method = 'POST',
  children,
  context = {},
  intent,
  ...props
}: FormProps) => {
  const formRef = useRef(null)

  const submit = useSubmit()
  const action = useFormAction()

  const submitFromWithin = useCallback(
    () => setTimeout(() => submit(formRef.current, { method, action }), 1),
    [action, method, submit],
  )

  return (
    <BaseForm {...props} ref={formRef} method={method}>
      <FormLayout>
        {intent && <input type="hidden" name="intent" value={intent} />}

        {Object.entries(context).map(
          ([key, value]) =>
            value != null && (
              <input
                type="hidden"
                key={key}
                name={key}
                value={
                  typeof value === 'boolean'
                    ? value === true
                      ? 'on'
                      : 'off'
                    : value
                }
              />
            ),
        )}

        {typeof children === 'function'
          ? children({ submit: submitFromWithin })
          : children}
      </FormLayout>
    </BaseForm>
  )
}

Form.Actions = FormLayout.Actions
Form.Section = FormLayout.Section
