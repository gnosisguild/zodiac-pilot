import { AllHTMLAttributes, useId } from 'react'

type InputProps = AllHTMLAttributes<HTMLInputElement> & {
  label: string
}

export const Input = ({ label, ...props }: InputProps) => {
  const id = useId()

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="ml-2 font-semibold">
        {label}
      </label>
      <input
        {...props}
        id={id}
        className="w-full rounded border border-gray-100 bg-gray-50 px-2 py-1"
      />
    </div>
  )
}
