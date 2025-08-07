import type { ComponentPropsWithoutRef } from 'react'

type LabelProps = Omit<ComponentPropsWithoutRef<'label'>, 'className'> & {
  required: boolean
}

export const Label = ({
  htmlFor,
  children,
  required,
  ...props
}: LabelProps) => (
  <label
    {...props}
    htmlFor={htmlFor}
    className="text-sm font-semibold dark:text-zinc-50"
  >
    {children}
    {required && <span className="ml-1 font-semibold text-red-400">*</span>}
  </label>
)
