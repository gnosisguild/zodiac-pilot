import { Transition } from '@headlessui/react'
import { useState, type PropsWithChildren, type ReactNode } from 'react'
import { default as Stick } from 'react-stick'

type PopoverProps = PropsWithChildren<{
  popover: ReactNode
}>

console.log({ Stick })

export const Popover = ({ popover, children }: PopoverProps) => {
  const [hover, setHover] = useState(false)

  return (
    <Stick
      position="middle right"
      node={
        <Transition show={hover}>
          <div className="ml-2 rounded-md bg-white p-2 text-zinc-900 shadow-md transition ease-in data-[closed]:opacity-0">
            {popover}
          </div>
        </Transition>
      }
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {children}
    </Stick>
  )
}
