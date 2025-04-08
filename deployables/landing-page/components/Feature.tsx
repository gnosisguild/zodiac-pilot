import classNames from 'classnames'
import type { PropsWithChildren, ReactNode } from 'react'

type FeatureProps = PropsWithChildren<{
  section: string
  title: string
  description: ReactNode
  color: 'teal' | 'indigo' | 'amber' | 'pink'
  media?: ReactNode
}>

export const Feature = ({
  section,
  title,
  description,
  children,
  color,
  media,
}: FeatureProps) => (
  <div
    className={classNames(
      'bg-linear-0 lg:bg-radial-[at_40%_50%] flex min-h-screen w-full snap-start snap-always items-center overflow-hidden via-25% py-24 sm:py-32 lg:via-0% lg:to-60% dark:from-zinc-950 dark:to-zinc-950',
      color === 'teal' && 'via-teal-400/50 dark:via-teal-500/50',
      color === 'indigo' && 'via-indigo-400/50 dark:via-indigo-500/50',
      color === 'amber' && 'via-amber-300/50 dark:via-amber-500/50',
      color === 'pink' && 'via-pink-400/50 dark:via-pink-500/50',
    )}
  >
    <div className="mx-4 lg:mx-12 2xl:mx-auto 2xl:max-w-7xl 2xl:px-8">
      <div className="mx-auto grid max-w-2xl grid-cols-1 items-center gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2 2xl:gap-x-8">
        <div className="lg:pr-8 lg:pt-4">
          <div className="lg:max-w-lg">
            <h2
              className={classNames(
                'inline-flex px-2 text-base/7 font-semibold',
                color === 'teal' &&
                  'bg-teal-500 text-teal-50 dark:bg-teal-600 dark:text-white',
                color === 'indigo' &&
                  'bg-indigo-500 text-indigo-50 dark:bg-indigo-600 dark:text-white',
                color === 'amber' &&
                  'bg-amber-500 text-amber-50 dark:bg-amber-600 dark:text-white',
                color === 'pink' &&
                  'bg-pink-500 text-pink-50 dark:bg-pink-600 dark:text-white',
              )}
            >
              {section}
            </h2>
            <p className="mt-2 text-pretty text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
              {title}
            </p>
            <p className="mt-6 text-lg/8 text-zinc-800 dark:text-zinc-200">
              {description}
            </p>

            {children}
          </div>
        </div>
        <div className="w-[48rem] max-w-full items-center overflow-hidden rounded-xl shadow-xl ring-1 ring-gray-400/10 md:-ml-4 md:w-[57rem] lg:-ml-0 2xl:max-w-none">
          {media}
        </div>
      </div>
    </div>
  </div>
)
