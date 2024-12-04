import { ComponentPropsWithoutRef } from 'react'

export const Label = ({
  htmlFor,
  ...props
}: Omit<ComponentPropsWithoutRef<'label'>, 'className'>) => (
  <label
    {...props}
    htmlFor={htmlFor}
    className="text-sm font-semibold dark:text-zinc-50"
  />
)
