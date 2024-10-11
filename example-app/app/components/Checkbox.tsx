import { ComponentPropsWithoutRef, PropsWithChildren, useId } from 'react'

type CheckboxProps = PropsWithChildren<
  Omit<ComponentPropsWithoutRef<'input'>, 'type' | 'id'>
>

export const Checkbox = ({ children, ...props }: CheckboxProps) => {
  const id = useId()

  return (
    <div className="flex items-center gap-2">
      <input {...props} id={id} type="checkbox" />
      <label htmlFor={id} className="font-semibold">
        {children}
      </label>
    </div>
  )
}
