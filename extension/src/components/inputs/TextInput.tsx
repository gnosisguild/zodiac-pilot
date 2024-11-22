import { ComponentPropsWithoutRef } from 'react'
import { Input } from './Input'

type TextInputProps = Omit<
  ComponentPropsWithoutRef<'input'>,
  'id' | 'type' | 'className'
> & {
  label: string
  description?: string
}

export const TextInput = ({ label, description, ...props }: TextInputProps) => (
  <Input label={label} description={description}>
    {({ inputId, descriptionId }) => (
      <input
        {...props}
        type="text"
        id={inputId}
        aria-describedby={descriptionId}
        className="rounded-md border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-white outline-none transition-all enabled:hover:border-zinc-500"
      />
    )}
  </Input>
)
