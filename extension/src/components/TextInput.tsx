import { ComponentPropsWithoutRef } from 'react'
import { Input } from './Input'

type TextInputProps = Omit<
  ComponentPropsWithoutRef<'input'>,
  'id' | 'type' | 'className'
> & {
  label: string
}

export const TextInput = ({ label, ...props }: TextInputProps) => (
  <Input label={label}>
    {(id) => (
      <input
        {...props}
        type="text"
        id={id}
        className="border border-zodiac-light-mustard border-opacity-80 bg-transparent px-3 py-2 font-mono text-sm text-white outline-none transition-all hover:border-white"
      />
    )}
  </Input>
)
