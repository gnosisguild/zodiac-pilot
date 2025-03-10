import classNames from 'classnames'
import type { PropsWithChildren } from 'react'

type FeatureProps = PropsWithChildren<{
  section: string
  title: string
  description: string
  color: 'teal' | 'indigo' | 'amber' | 'blue'
}>

export const Feature = ({
  section,
  title,
  description,
  children,
  color,
}: FeatureProps) => (
  <div className={classNames('w-full overflow-hidden py-24 sm:py-32')}>
    <div className="mx-auto max-w-7xl px-6 lg:px-8">
      <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
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
                color === 'blue' &&
                  'bg-blue-500 text-blue-50 dark:bg-blue-600 dark:text-white',
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
        <img
          alt="Product screenshot"
          src="https://tailwindcss.com/plus-assets/img/component-images/dark-project-app-screenshot.png"
          width={2432}
          height={1442}
          className="w-[48rem] max-w-none rounded-xl shadow-xl ring-1 ring-gray-400/10 sm:w-[57rem] md:-ml-4 lg:-ml-0"
        />
      </div>
    </div>
  </div>
)
