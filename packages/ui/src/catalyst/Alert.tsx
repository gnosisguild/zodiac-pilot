import * as Headless from '@headlessui/react'
import classNames from 'classnames'
import type React from 'react'
import { Text } from './Text'

const sizes = {
  xs: 'sm:max-w-xs',
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-xl',
  '2xl': 'sm:max-w-2xl',
  '3xl': 'sm:max-w-3xl',
  '4xl': 'sm:max-w-4xl',
  '5xl': 'sm:max-w-5xl',
}

export function Alert({
  size = 'md',
  className,
  children,
  ...props
}: {
  size?: keyof typeof sizes
  className?: string
  children: React.ReactNode
} & Omit<Headless.DialogProps, 'as' | 'className'>) {
  return (
    <Headless.Dialog {...props}>
      <Headless.DialogBackdrop
        transition
        className="data-closed:opacity-0 data-closed:backdrop-blur-0 backdrop-blur-xs data-enter:ease-out data-leave:ease-in z-999 fixed inset-0 flex w-screen justify-center overflow-y-auto bg-zinc-950/15 px-2 py-2 transition duration-300 focus:outline-0 sm:px-6 sm:py-8 lg:px-8 lg:py-16 dark:bg-slate-900/20"
      />

      <div className="z-999 fixed inset-0 w-screen overflow-y-auto pt-6 sm:pt-0">
        <div className="grid min-h-full grid-rows-[1fr_auto_1fr] justify-items-center p-8 sm:grid-rows-[1fr_auto_3fr] sm:p-4">
          <Headless.DialogPanel
            transition
            className={classNames(
              className,
              sizes[size],
              'row-start-2 w-full rounded-2xl bg-white p-8 shadow-lg ring-1 ring-zinc-950/10 sm:rounded-2xl sm:p-6 dark:bg-zinc-900 dark:ring-white/10 forced-colors:outline',
              'data-closed:opacity-0 md:data-closed:translate-y-0 data-closed:translate-y-full data-enter:ease-out data-closed:data-enter:scale-95 data-leave:ease-in w-full transition duration-100 will-change-transform md:w-1/3',
            )}
          >
            {children}
          </Headless.DialogPanel>
        </div>
      </div>
    </Headless.Dialog>
  )
}

export function AlertTitle({
  className,
  ...props
}: { className?: string } & Omit<
  Headless.DialogTitleProps,
  'as' | 'className'
>) {
  return (
    <Headless.DialogTitle
      {...props}
      className={classNames(
        className,
        'text-balance text-center text-base/6 font-semibold text-zinc-950 sm:text-wrap sm:text-left sm:text-sm/6 dark:text-white',
      )}
    />
  )
}

export function AlertDescription({
  className,
  ...props
}: { className?: string } & Omit<
  Headless.DescriptionProps<typeof Text>,
  'as' | 'className'
>) {
  return (
    <Headless.Description
      as={Text}
      {...props}
      className={classNames(
        className,
        'mt-2 text-pretty text-center sm:text-left',
      )}
    />
  )
}

export function AlertBody({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  return <div {...props} className={classNames(className, 'mt-4')} />
}

export function AlertActions({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      {...props}
      className={classNames(
        className,
        'mt-6 flex flex-col-reverse items-center justify-end gap-3 *:w-full sm:mt-4 sm:flex-row-reverse sm:justify-start sm:*:w-auto',
      )}
    />
  )
}
