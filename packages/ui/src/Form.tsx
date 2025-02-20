import classNames from 'classnames'
import {
  useCallback,
  useRef,
  type ComponentProps,
  type PropsWithChildren,
  type ReactNode,
} from 'react'
import { Form as BaseForm, useSubmit } from 'react-router'

type RenderProps = {
  submit: () => void
}

type FormProps = Omit<
  ComponentProps<typeof BaseForm>,
  'className' | 'children'
> & {
  intent?: string
  context?: Record<string, string | null>
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

  const submitFromWithin = useCallback(
    () => setTimeout(() => submit(formRef.current, { method }), 1),
    [method, submit],
  )

  return (
    <BaseForm
      {...props}
      ref={formRef}
      method={method}
      className="flex flex-col gap-4"
    >
      {intent && <input type="hidden" name="intent" value={intent} />}

      {Object.entries(context).map(
        ([key, value]) =>
          value != null && (
            <input type="hidden" key={key} name={key} value={value} />
          ),
      )}

      {typeof children === 'function'
        ? children({ submit: submitFromWithin })
        : children}
    </BaseForm>
  )
}

type ActionsProps = PropsWithChildren<{ align?: 'right' | 'left' }>

const Actions = ({ children, align = 'right' }: ActionsProps) => (
  <div
    className={classNames(
      'mt-8 flex items-center justify-between gap-8',
      align === 'left' && 'justify-start',
      align === 'right' && 'justify-end',
    )}
  >
    {children}
  </div>
)

Form.Actions = Actions
