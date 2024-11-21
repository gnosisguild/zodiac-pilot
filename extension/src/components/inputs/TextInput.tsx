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
        className="border border-zodiac-light-mustard border-opacity-80 bg-transparent px-3 py-2 font-mono text-sm text-white outline-none transition-all hover:border-white"
      />
    )}
  </Input>
)
