import { ComponentPropsWithoutRef } from 'react'
import { Input } from './Input'

type TextInputProps = Omit<
  ComponentPropsWithoutRef<'input'>,
  'id' | 'type' | 'className'
> & {
  label: string
  description?: string
  error?: string | null
}

export const TextInput = ({
  label,
  description,
  error,
  ...props
}: TextInputProps) => (
  <Input label={label} description={description} error={error}>
    {({ inputId, descriptionId }) => (
      <input
        {...props}
        type="text"
        id={inputId}
        aria-describedby={descriptionId}
        aria-errormessage={error ?? undefined}
        className="rounded-md border border-zinc-300 bg-zinc-100 px-3 py-2 text-sm shadow-sm outline-none transition-all dark:border-zinc-600 dark:bg-zinc-800 dark:text-white dark:enabled:hover:border-zinc-500"
      />
    )}
  </Input>
)
