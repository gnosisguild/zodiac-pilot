import classNames from 'classnames'
import { type ComponentPropsWithoutRef, useId } from 'react'

type InputProps = Omit<ComponentPropsWithoutRef<'input'>, 'id'> & {
  label: string
}

export const Input = ({ label, children, disabled, ...props }: InputProps) => {
  const id = useId()

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="ml-4 font-semibold">
        {label}
      </label>

      <input
        {...props}
        id={id}
        disabled={disabled}
        className={classNames(
          'w-full rounded-sm border border-gray-200 bg-gray-100 px-4 py-2 outline-hidden ring-2 ring-transparent focus:border-blue-600 focus:ring-blue-300',
          disabled && 'opacity-50',
        )}
      />

      {children && <div className="ml-4">{children}</div>}
    </div>
  )
}
