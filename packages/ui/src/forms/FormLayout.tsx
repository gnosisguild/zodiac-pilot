import classNames from 'classnames'
import type { PropsWithChildren } from 'react'

export const FormLayout = ({ children }: PropsWithChildren) => (
  <div className="flex max-w-5xl flex-col gap-4">{children}</div>
)

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

FormLayout.Actions = Actions

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

FormLayout.Section = Section
