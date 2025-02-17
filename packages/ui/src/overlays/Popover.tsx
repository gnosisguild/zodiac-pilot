import { Transition } from '@headlessui/react'
import { useState, type PropsWithChildren, type ReactNode } from 'react'
import { Stick } from './Stick'

type PopoverProps = PropsWithChildren<{
  popover: ReactNode
}>

export const Popover = ({ popover, children }: PopoverProps) => {
  const [hover, setHover] = useState(false)

  return (
    <Stick
      position="middle right"
      node={
        <Transition show={hover}>
          <div className="ml-2 rounded-md bg-zinc-950 px-2 pb-1 text-white shadow-md transition ease-in data-[closed]:opacity-0 dark:bg-white dark:text-zinc-900">
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
