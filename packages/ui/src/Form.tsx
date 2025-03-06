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
  context?: Record<string, string | number | null | undefined>
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
      className="flex max-w-5xl flex-col gap-4"
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
      'mt-8 flex flex-row-reverse items-center gap-2',
      align === 'left' && 'justify-end',
      align === 'right' && 'justify-start',
    )}
  >
    {children}
  </div>
)

Form.Actions = Actions

type SectionProps = PropsWithChildren<{ title: string; description?: string }>

const Section = ({ title, description, children }: SectionProps) => (
  <section className="mb-12 grid grid-cols-6 gap-x-8 gap-y-10 border-b border-gray-900/10 pb-12 last-of-type:mb-0 dark:border-slate-100/10">
    <div className="col-span-2">
      <h2 className="text-base/7 font-semibold">{title}</h2>

      {description && (
        <p className="mt-1 text-sm/6 text-gray-600 dark:text-slate-300">
          {description}
        </p>
      )}
    </div>

    <div className="col-span-4 flex flex-col gap-8">{children}</div>
  </section>
)

Form.Section = Section
