import type { ComponentPropsWithRef } from 'react'

export const BareInput = (
  props: Omit<ComponentPropsWithRef<'input'>, 'className'>,
) => (
  <input
    {...props}
    className="outline-hidden w-full appearance-none border-none bg-transparent px-4 py-2 text-sm"
  />
)
