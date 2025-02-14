import classNames from 'classnames'
import type { ComponentProps, PropsWithChildren } from 'react'
import { Form as BaseForm } from 'react-router'

type FormProps = Omit<ComponentProps<typeof BaseForm>, 'className'> & {
  context?: Record<string, string | null>
}

export const Form = ({
  method = 'POST',
  children,
  context = {},
  ...props
}: FormProps) => (
  <BaseForm {...props} method={method} className="flex flex-col gap-4">
    {Object.entries(context).map(
      ([key, value]) =>
        value != null && (
          <input type="hidden" key={key} name={key} value={value} />
        ),
    )}

    {children}
  </BaseForm>
)

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
