import {
  useId,
  type ComponentPropsWithoutRef,
  type PropsWithChildren,
} from 'react'

type CheckboxProps = PropsWithChildren<
  Omit<ComponentPropsWithoutRef<'input'>, 'type' | 'id' | 'className'>
>

export const Checkbox = ({ children, ...props }: CheckboxProps) => {
  const id = useId()

  return (
    <div className="inline-flex items-center">
      <input
        id={id}
        type="checkbox"
        className="cursor-pointer accent-indigo-500 dark:accent-teal-500"
        {...props}
      />

      <label
        htmlFor={id}
        className="ml-2 cursor-pointer select-none text-sm dark:text-gray-50"
      >
        {children}
      </label>
    </div>
  )
}
