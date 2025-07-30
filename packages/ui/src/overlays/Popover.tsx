import { Transition } from '@headlessui/react'
import classNames from 'classnames'
import { useState, type PropsWithChildren, type ReactNode } from 'react'
import { Stick } from './Stick'

export type PopoverPosition = 'top' | 'right' | 'bottom' | 'left'

type PopoverProps = PropsWithChildren<{
  popover: ReactNode
  position?: PopoverPosition
  inline?: boolean
}>

export const Popover = ({
  popover,
  children,
  position = 'top',
  inline = false,
}: PopoverProps) => {
  const [hover, setHover] = useState(false)

  if (!popover) {
    return <>{children}</>
  }

  return (
    <Stick
      autoFlipHorizontally
      position={getStickPosition(position)}
      className={classNames(inline ? 'inline' : 'flex')}
      node={
        <Transition show={hover}>
          <div
            className={classNames(
              'relative rounded-md bg-zinc-950 px-2 py-1 text-white shadow-md transition ease-in data-[closed]:opacity-0 dark:bg-white dark:text-zinc-900',
              position === 'top' && 'mb-2',
              position === 'bottom' && 'mt-2',
              position === 'left' && 'mr-2',
              position === 'right' && 'ml-2',
              getArrowClasses(position),
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

const getArrowClasses = (position: PopoverPosition) =>
  classNames(
    'before:absolute before:border-4 before:content-[""]',
    (position === 'top' || position === 'bottom') &&
      'before:border-r-transparent before:border-l-transparent before:left-1/2 before:-translate-x-1/2',
    position === 'top' &&
      'before:bottom-0 before:translate-y-full before:border-t-zinc-950 dark:before:border-t-white before:border-b-transparent',
    position === 'bottom' &&
      'before:top-0 before:-translate-y-full before:border-t-transparent before:border-b-zinc-950 dark:before:border-b-white',

    (position === 'left' || position === 'right') &&
      'before:border-t-transparent before:border-b-transparent before:top-1/2 before:-translate-y-1/2',
    position === 'left' &&
      'before:right-0 before:translate-x-full before:border-l-zinc-950 dark:before:border-l-white before:border-r-transparent',
    position === 'right' &&
      'before:left-0 before:-translate-x-full before:border-l-transparent before:border-r-zinc-950 dark:before:border-r-white',
  )

const getStickPosition = (position: PopoverPosition) => {
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
