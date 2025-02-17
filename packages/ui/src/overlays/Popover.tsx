import { Transition } from '@headlessui/react'
import classNames from 'classnames'
import { useState, type PropsWithChildren, type ReactNode } from 'react'
import { Stick } from './Stick'

type PopoverProps = PropsWithChildren<{
  popover: ReactNode
  position?: 'top' | 'right' | 'bottom' | 'left'
}>

export const Popover = ({
  popover,
  children,
  position = 'top',
}: PopoverProps) => {
  const [hover, setHover] = useState(false)

  return (
    <Stick
      position={getStickPosition(position)}
      node={
        <Transition show={hover}>
          <div
            className={classNames(
              'rounded-md bg-zinc-950 px-2 py-1 text-white shadow-md transition ease-in data-[closed]:opacity-0 dark:bg-white dark:text-zinc-900',
              position === 'top' && 'mb-2',
              position === 'bottom' && 'mt-2',
              position === 'left' && 'mr-2',
              position === 'right' && 'ml-2',
            )}
          >
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

const getStickPosition = (position: PopoverProps['position']) => {
  switch (position) {
    case 'top':
      return 'top center'
    case 'right':
      return 'middle right'
    case 'bottom':
      return 'bottom center'
    case 'left':
      return 'middle left'
  }
}
