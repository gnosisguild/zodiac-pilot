import { useId, type ComponentPropsWithoutRef } from 'react'

type CheckboxProps = Omit<
  ComponentPropsWithoutRef<'input'>,
  'type' | 'id' | 'className'
> & {
  label: string
}

export const Checkbox = ({ label, ...props }: CheckboxProps) => {
  const id = useId()

  return (
    <div className="inline-flex items-center">
      <div className="relative flex cursor-pointer items-center">
        <input
          id={id}
          type="checkbox"
          className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-slate-300 shadow transition-all checked:border-slate-800 checked:bg-slate-800 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900 dark:checked:border-zinc-700 dark:checked:bg-zinc-800"
          {...props}
        />

        <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3.5 w-3.5"
            viewBox="0 0 20 20"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="1"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 
                 1 0 011.414-1.414L8 12.586l7.293-7.293a1 
                 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </div>

      <label htmlFor={id} className="ml-2 text-sm dark:text-gray-50">
        {label}
      </label>
    </div>
  )
}
