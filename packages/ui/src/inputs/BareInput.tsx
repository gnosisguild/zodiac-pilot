import type { ComponentPropsWithRef } from 'react'

export const BareInput = (
  props: Omit<ComponentPropsWithRef<'input'>, 'className'>,
) => (
  <input
    {...props}
    {...props}
    type="text"
    className="outline-hidden w-full border-none bg-transparent px-4 py-2 text-sm"
  />
)
